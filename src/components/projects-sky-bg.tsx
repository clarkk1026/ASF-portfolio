import { useEffect, useRef } from 'react';

type SkyStar = {
	x: number;
	y: number;
	r: number;
	base: number;
	speed: number;
	phase: number;
	temperature: number;
	spike: boolean;
};

/** Brighter upper-sky field with frequent shining twinkles. */
const STAR_COUNT = 85;
const PAINT_MS = 1000 / 36;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const createGlowSprite = () => {
	const sprite = document.createElement('canvas');
	sprite.width = 48;
	sprite.height = 48;
	const gctx = sprite.getContext('2d');
	if (gctx) {
		const glow = gctx.createRadialGradient(24, 24, 0, 24, 24, 24);
		glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
		glow.addColorStop(0.22, 'rgba(200, 230, 255, 0.45)');
		glow.addColorStop(0.55, 'rgba(120, 190, 255, 0.12)');
		glow.addColorStop(1, 'rgba(60, 120, 200, 0)');
		gctx.fillStyle = glow;
		gctx.fillRect(0, 0, 48, 48);
	}
	return sprite;
};

const createStars = (width: number, height: number): SkyStar[] => {
	const skyH = height * 0.58;
	return Array.from({ length: STAR_COUNT }, () => {
		const bright = Math.random() > 0.76;
		const mid = !bright && Math.random() > 0.45;
		return {
			x: Math.random() * width,
			y: Math.random() ** 1.1 * skyH,
			r: bright
				? rand(0.7, 1.3)
				: mid
					? rand(0.4, 0.8)
					: rand(0.2, 0.48),
			base: bright
				? rand(0.55, 0.9)
				: mid
					? rand(0.35, 0.62)
					: rand(0.22, 0.45),
			speed: bright ? rand(2.4, 5.0) : rand(1.6, 3.8),
			phase: rand(0, Math.PI * 2),
			temperature: rand(0.08, 0.55),
			spike: bright || Math.random() > 0.82,
		};
	});
};

const drawStars = (
	ctx: CanvasRenderingContext2D,
	stars: SkyStar[],
	time: number,
	glow: HTMLCanvasElement,
) => {
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';

	for (const star of stars) {
		const t = time * 0.001;
		const wave =
			0.5 +
			0.5 *
				Math.sin(t * star.speed + star.phase) *
				(0.68 +
					0.32 * Math.sin(t * star.speed * 1.75 + star.phase * 0.5));
		const shimmer = Math.pow(Math.max(0, wave), 2.8);
		const alpha = Math.min(
			1,
			star.base * (0.42 + wave * 0.58) + shimmer * 0.85,
		);
		const red = Math.round(230 + star.temperature * 22);
		const green = Math.round(238 + star.temperature * 12);
		const coreR = star.r * (0.9 + shimmer * 0.42);

		const glowR = coreR * (3.0 + shimmer * 3.2);
		ctx.globalAlpha = alpha * (0.2 + shimmer * 0.42);
		ctx.drawImage(glow, star.x - glowR, star.y - glowR, glowR * 2, glowR * 2);

		ctx.globalAlpha = alpha;
		ctx.fillStyle = `rgba(${red}, ${green}, 255, 1)`;
		ctx.beginPath();
		ctx.arc(star.x, star.y, coreR, 0, Math.PI * 2);
		ctx.fill();

		if (shimmer > 0.35) {
			ctx.globalAlpha = alpha * (0.55 + shimmer * 0.42);
			ctx.fillStyle = 'rgba(255, 255, 255, 1)';
			ctx.beginPath();
			ctx.arc(star.x, star.y, coreR * 0.38, 0, Math.PI * 2);
			ctx.fill();
		}

		if (star.spike && shimmer > 0.26) {
			const arm = coreR * (2.6 + shimmer * 3.4);
			ctx.globalAlpha = alpha * (0.24 + shimmer * 0.4);
			ctx.strokeStyle = `rgba(${red}, ${green}, 255, 1)`;
			ctx.lineWidth = 0.45 + shimmer * 0.4;
			ctx.beginPath();
			ctx.moveTo(star.x - arm, star.y);
			ctx.lineTo(star.x + arm, star.y);
			ctx.moveTo(star.x, star.y - arm);
			ctx.lineTo(star.x, star.y + arm);
			ctx.stroke();
		}
	}

	ctx.restore();
};

export const ProjectsSkyBg = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d', {
			alpha: true,
			desynchronized: true,
		});
		if (!ctx) return;

		const reducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;
		const glow = createGlowSprite();

		let width = window.innerWidth;
		let height = window.innerHeight;
		let stars = createStars(width, height);
		let animationId = 0;
		let lastPaint = 0;

		const resize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			stars = createStars(width, height);
		};

		const paint = (time: number) => {
			ctx.clearRect(0, 0, width, height);
			drawStars(ctx, stars, time, glow);
		};

		const render = (time: number) => {
			if (time - lastPaint >= PAINT_MS) {
				lastPaint = time;
				paint(time);
			}
			if (!reducedMotion) {
				animationId = requestAnimationFrame(render);
			}
		};

		resize();
		paint(performance.now());
		window.addEventListener('resize', resize);
		animationId = requestAnimationFrame(render);

		return () => {
			window.removeEventListener('resize', resize);
			cancelAnimationFrame(animationId);
		};
	}, []);

	return (
		<div
			className='projects-sky'
			aria-hidden='true'
		>
			<img
				className='projects-sky-image'
				src='/projects-nature-night-4k.webp?v=seahq'
				alt=''
				decoding='async'
				fetchPriority='high'
			/>
			<span className='projects-sky-atmosphere' />
			<canvas
				ref={canvasRef}
				className='projects-sky-effects'
			/>
			<span className='projects-sky-veil' />
			<span className='projects-sky-shade' />
		</div>
	);
};
