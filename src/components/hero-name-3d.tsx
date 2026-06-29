import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
	drawFireParticle,
	drawLightningBolt,
	spawnFireParticle,
	spawnLightningBolt,
	type FireParticle,
	type LightningBolt,
} from '../lib/hero-name-fx';

type HeroName3DProps = {
	text: string;
	className?: string;
};

type LetterRect = {
	left: number;
	top: number;
	width: number;
	height: number;
};

export const HeroName3D = ({ text, className = '' }: HeroName3DProps) => {
	const displayText = text.replace(/\s/g, '').toUpperCase();
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
	const hoveredRef = useRef<number | null>(null);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	useEffect(() => {
		hoveredRef.current = hoveredIndex;
	}, [hoveredIndex]);

	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;
		if (!container || !canvas) return undefined;

		const ctx = canvas.getContext('2d');
		if (!ctx) return undefined;

		let frameId = 0;
		let running = true;
		let bolts: LightningBolt[] = [];
		let particles: FireParticle[] = [];
		let spawnTimer = 0;
		let fireTimer = 0;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);

		const resize = () => {
			const rect = container.getBoundingClientRect();
			const width = Math.max(1, Math.ceil(rect.width));
			const height = Math.max(1, Math.ceil(rect.height));
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const getLetterRects = (): LetterRect[] =>
			letterRefs.current
				.filter((el): el is HTMLSpanElement => el !== null)
				.map((el) => {
					const letterRect = el.getBoundingClientRect();
					const canvasRect = canvas.getBoundingClientRect();
					return {
						left: letterRect.left - canvasRect.left,
						top: letterRect.top - canvasRect.top,
						width: letterRect.width,
						height: letterRect.height,
					};
				});

		const tick = () => {
			if (!running) return;

			const width = canvas.width / dpr;
			const height = canvas.height / dpr;

			spawnTimer -= 1;
			if (spawnTimer <= 0) {
				const count = Math.random() > 0.55 ? 2 : 1;
				for (let i = 0; i < count; i += 1) {
					bolts.push(spawnLightningBolt(width, height));
				}
				spawnTimer = 10 + Math.floor(Math.random() * 18);
			}

			bolts = bolts
				.map((bolt) => ({
					...bolt,
					life: bolt.life - 1,
					branch: bolt.branch
						? { ...bolt.branch, life: bolt.branch.life - 1 }
						: undefined,
				}))
				.filter((bolt) => bolt.life > 0);

			fireTimer -= 1;
			if (hoveredRef.current !== null && fireTimer <= 0) {
				const rects = getLetterRects();
				const rect = rects[hoveredRef.current];
				if (rect) {
					const emitX = rect.left + rect.width * 0.5;
					const emitY = rect.top + rect.height * 0.72;
					const burst = window.matchMedia('(prefers-reduced-motion: reduce)').matches
						? 2
						: 6;
					for (let i = 0; i < burst; i += 1) {
						particles.push(spawnFireParticle(emitX, emitY, rect.width));
					}
				}
				fireTimer = 2;
			}

			particles = particles
				.map((particle) => ({
					...particle,
					x: particle.x + particle.vx,
					y: particle.y + particle.vy,
					vx: particle.vx * 0.98,
					vy: particle.vy - 0.06,
					life: particle.life - 1,
					size: particle.size * 0.985,
				}))
				.filter((particle) => particle.life > 0);

			ctx.clearRect(0, 0, width, height);

			for (const bolt of bolts) {
				drawLightningBolt(ctx, bolt);
			}

			for (const particle of particles) {
				drawFireParticle(ctx, particle);
			}

			frameId = window.requestAnimationFrame(tick);
		};

		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(container);
		frameId = window.requestAnimationFrame(tick);

		return () => {
			running = false;
			window.cancelAnimationFrame(frameId);
			observer.disconnect();
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={`hero-name-3d ${className}`.trim()}
			aria-label={displayText}
		>
			<div className='hero-name-3d-letters'>
				{displayText.split('').map((char, index) => (
					<span
						key={`${char}-${index}`}
						ref={(el) => {
							letterRefs.current[index] = el;
						}}
						className={`hero-letter-block${hoveredIndex === index ? ' is-hovered' : ''}`}
						style={{ '--i': index } as CSSProperties}
						onMouseEnter={() => setHoveredIndex(index)}
						onMouseLeave={() => setHoveredIndex(null)}
					>
						<span
							className='hero-letter-depth'
							aria-hidden='true'
						>
							{char}
						</span>
						<span className='hero-letter-face'>{char}</span>
						<span
							className='hero-letter-glow'
							aria-hidden='true'
						>
							{char}
						</span>
					</span>
				))}
			</div>
			<canvas
				ref={canvasRef}
				className='hero-name-3d-canvas'
				aria-hidden='true'
			/>
		</div>
	);
};
