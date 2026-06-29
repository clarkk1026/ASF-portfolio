import { useEffect, useRef, useState } from 'react';
import {
	drawFireParticle,
	drawGlowPulse,
	drawLightningBolt,
	spawnFireParticle,
	spawnGlowPulse,
	spawnNaturalBolt,
	type FireParticle,
	type GlowPulse,
	type LetterRect,
	type LightningBolt,
} from '../lib/hero-name-fx';

type HeroName3DProps = {
	text: string;
	className?: string;
};

type EmitZone = {
	x: number;
	y: number;
	width: number;
};

const MAX_PARTICLES = 18;

export const HeroName3D = ({ text, className = '' }: HeroName3DProps) => {
	const displayText = text.replace(/\s/g, '').toUpperCase();
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
	const emitZoneRef = useRef<EmitZone | null>(null);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	const handleLetterEnter = (index: number) => {
		setHoveredIndex(index);
		const letter = letterRefs.current[index];
		const canvas = canvasRef.current;
		if (!letter || !canvas) return;

		const letterRect = letter.getBoundingClientRect();
		const canvasRect = canvas.getBoundingClientRect();
		emitZoneRef.current = {
			x: letterRect.left - canvasRect.left + letterRect.width * 0.5,
			y: letterRect.top - canvasRect.top + letterRect.height * 0.75,
			width: letterRect.width,
		};
	};

	const handleLetterLeave = () => {
		setHoveredIndex(null);
		emitZoneRef.current = null;
	};

	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;
		if (!container || !canvas) return undefined;

		const ctx = canvas.getContext('2d', { alpha: true });
		if (!ctx) return undefined;

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

		let frameId = 0;
		let running = true;
		let visible = true;
		let bolts: LightningBolt[] = [];
		let pulses: GlowPulse[] = [];
		let particles: FireParticle[] = [];
		let lastFrame = performance.now();
		let fireCooldown = 0;
		let boltCooldown = 6;
		let letterCache: LetterRect[] = [];
		let letterCacheTimer = 0;

		const resize = () => {
			const rect = container.getBoundingClientRect();
			const width = Math.max(1, Math.ceil(rect.width));
			const height = Math.max(1, Math.ceil(rect.height));
			canvas.width = Math.floor(width * dpr);
			canvas.height = Math.floor(height * dpr);
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
					const left = letterRect.left - canvasRect.left;
					const top = letterRect.top - canvasRect.top;
					return {
						left,
						top,
						width: letterRect.width,
						height: letterRect.height,
						centerX: left + letterRect.width * 0.5,
						centerY: top + letterRect.height * 0.5,
					};
				});

		const tick = (now: number) => {
			if (!running) return;

			if (!visible || reducedMotion) {
				lastFrame = now;
				frameId = window.requestAnimationFrame(tick);
				return;
			}

			const dt = Math.min((now - lastFrame) / 16.67, 2);
			lastFrame = now;
			const width = canvas.width / dpr;
			const height = canvas.height / dpr;

			letterCacheTimer -= dt;
			if (letterCacheTimer <= 0) {
				letterCache = getLetterRects();
				letterCacheTimer = 24;
			}

			boltCooldown -= dt;
			if (boltCooldown <= 0 && bolts.length < 3) {
				const bolt = spawnNaturalBolt(width, height, letterCache);
				bolts.push(bolt);
				const tip = bolt.segments[0][bolt.segments[0].length - 1];
				pulses.push(spawnGlowPulse(tip.x, tip.y));
				boltCooldown = 10 + Math.random() * 14;
			}

			bolts = bolts
				.map((bolt) => ({
					...bolt,
					life: bolt.life - dt,
					flash: bolt.flash + dt * 0.08,
				}))
				.filter((bolt) => bolt.life > 0);

			pulses = pulses
				.map((pulse) => ({ ...pulse, life: pulse.life - dt }))
				.filter((pulse) => pulse.life > 0);

			fireCooldown -= dt;
			const emit = emitZoneRef.current;
			if (emit && fireCooldown <= 0 && particles.length < MAX_PARTICLES) {
				for (let i = 0; i < 2; i += 1) {
					particles.push(spawnFireParticle(emit.x, emit.y, emit.width));
				}
				fireCooldown = 3;
			}

			particles = particles
				.map((particle) => ({
					...particle,
					x: particle.x + particle.vx * dt,
					y: particle.y + particle.vy * dt,
					vx: particle.vx * 0.99,
					vy: particle.vy - 0.02 * dt,
					life: particle.life - dt,
					size: particle.size * (1 - 0.002 * dt),
				}))
				.filter((particle) => particle.life > 0)
				.slice(-MAX_PARTICLES);

			ctx.clearRect(0, 0, width, height);

			for (const pulse of pulses) drawGlowPulse(ctx, pulse);
			for (const bolt of bolts) drawLightningBolt(ctx, bolt);
			for (const particle of particles) drawFireParticle(ctx, particle);

			frameId = window.requestAnimationFrame(tick);
		};

		resize();

		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(container);

		const visibilityObserver = new IntersectionObserver(
			([entry]) => {
				visible = entry?.isIntersecting ?? true;
			},
			{ threshold: 0.1 },
		);
		visibilityObserver.observe(container);

		const onVisibilityChange = () => {
			visible = document.visibilityState === 'visible';
		};
		document.addEventListener('visibilitychange', onVisibilityChange);

		frameId = window.requestAnimationFrame(tick);

		return () => {
			running = false;
			window.cancelAnimationFrame(frameId);
			resizeObserver.disconnect();
			visibilityObserver.disconnect();
			document.removeEventListener('visibilitychange', onVisibilityChange);
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
						className={`hero-letter${hoveredIndex === index ? ' is-hovered' : ''}`}
						onMouseEnter={() => handleLetterEnter(index)}
						onMouseLeave={handleLetterLeave}
					>
						{char}
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
