import { useEffect, useRef } from 'react';

type SkyStar = {
	x: number;
	y: number;
	radius: number;
	opacity: number;
	twinkleSpeed: number;
	phase: number;
	temperature: number;
};

const random = (min: number, max: number) => min + Math.random() * (max - min);

const createStars = (width: number, height: number): SkyStar[] => {
	const count = Math.min(220, Math.max(130, Math.round((width * height) / 11000)));

	return Array.from({ length: count }, () => ({
		x: Math.random() * width,
		y: Math.random() * height,
		radius: random(0.3, 1.05),
		opacity: random(0.16, 0.62),
		twinkleSpeed: random(1.3, 3.2),
		phase: random(0, Math.PI * 2),
		temperature: random(0, 1),
	}));
};

const drawStars = (
	ctx: CanvasRenderingContext2D,
	stars: SkyStar[],
	time: number,
	glowSprite: HTMLCanvasElement,
) => {
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';

	for (const star of stars) {
		const wave = 0.5 + 0.5 * Math.sin(time * 0.001 * star.twinkleSpeed + star.phase);
		const shimmer = Math.pow(wave, 8);
		const alpha = Math.min(star.opacity * (0.58 + wave * 0.42) + shimmer * 0.5, 1);
		const red = Math.round(218 + star.temperature * 37);
		const green = Math.round(232 + star.temperature * 18);

		if (shimmer > 0.42) {
			const glowRadius = star.radius * (4.5 + shimmer * 3);
			ctx.globalAlpha = alpha * 0.45;
			ctx.drawImage(
				glowSprite,
				star.x - glowRadius,
				star.y - glowRadius,
				glowRadius * 2,
				glowRadius * 2,
			);
			ctx.globalAlpha = 1;
		}

		ctx.fillStyle = `rgba(${red}, ${green}, 255, ${alpha})`;
		ctx.beginPath();
		ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
		ctx.fill();

		if (star.radius > 0.82 && shimmer > 0.66) {
			const spike = star.radius * (2.8 + shimmer * 2.4);
			ctx.strokeStyle = `rgba(210, 238, 255, ${alpha * 0.4})`;
			ctx.lineWidth = 0.45;
			ctx.beginPath();
			ctx.moveTo(star.x - spike, star.y);
			ctx.lineTo(star.x + spike, star.y);
			ctx.moveTo(star.x, star.y - spike);
			ctx.lineTo(star.x, star.y + spike);
			ctx.stroke();
		}
	}

	ctx.restore();
};

export const TeamSkyEffects = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const glowSprite = document.createElement('canvas');
		glowSprite.width = 48;
		glowSprite.height = 48;
		const glowCtx = glowSprite.getContext('2d');
		if (glowCtx) {
			const glow = glowCtx.createRadialGradient(24, 24, 0, 24, 24, 24);
			glow.addColorStop(0, 'rgba(225, 243, 255, 1)');
			glow.addColorStop(0.35, 'rgba(120, 190, 255, 0.3)');
			glow.addColorStop(1, 'rgba(80, 150, 255, 0)');
			glowCtx.fillStyle = glow;
			glowCtx.fillRect(0, 0, 48, 48);
		}

		const reducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;
		let width = window.innerWidth;
		let height = window.innerHeight;
		let stars: SkyStar[] = [];
		let animationId = 0;
		let lastDraw = 0;

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

		const render = (time: number) => {
			if (time - lastDraw >= 1000 / 30) {
				lastDraw = time;
				ctx.clearRect(0, 0, width, height);
				drawStars(ctx, stars, time, glowSprite);
			}

			if (!reducedMotion) {
				animationId = requestAnimationFrame(render);
			}
		};

		resize();
		window.addEventListener('resize', resize);
		animationId = requestAnimationFrame(render);

		return () => {
			window.removeEventListener('resize', resize);
			cancelAnimationFrame(animationId);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className='team-sky-effects'
			aria-hidden='true'
		/>
	);
};
