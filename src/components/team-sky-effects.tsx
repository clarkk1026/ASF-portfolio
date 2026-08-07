import { useEffect, useRef } from 'react';

type SkyStar = {
	x: number;
	y: number;
	radius: number;
	opacity: number;
	twinkleSpeed: number;
	phase: number;
	temperature: number;
	spike: boolean;
};

const random = (min: number, max: number) => min + Math.random() * (max - min);

const createStars = (width: number, height: number): SkyStar[] => {
	const count = Math.min(140, Math.max(85, Math.round((width * height) / 16000)));
	const skyH = height * 0.68;

	return Array.from({ length: count }, () => {
		const bright = Math.random() > 0.84;
		const mid = !bright && Math.random() > 0.5;
		return {
			x: Math.random() * width,
			y: Math.random() ** 1.12 * skyH,
			radius: bright
				? random(0.75, 1.3)
				: mid
					? random(0.42, 0.8)
					: random(0.2, 0.48),
			opacity: bright
				? random(0.48, 0.82)
				: mid
					? random(0.3, 0.55)
					: random(0.18, 0.4),
			twinkleSpeed: bright ? random(2.4, 5.0) : random(1.5, 3.8),
			phase: random(0, Math.PI * 2),
			temperature: random(0.05, 0.7),
			spike: bright,
		};
	});
};

const drawStars = (
	ctx: CanvasRenderingContext2D,
	stars: SkyStar[],
	time: number,
	glowSprite: HTMLCanvasElement,
) => {
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';

	const t = time * 0.001;
	for (const star of stars) {
		const primary = Math.sin(t * star.twinkleSpeed + star.phase);
		const secondary = Math.sin(
			t * star.twinkleSpeed * 1.73 + star.phase * 0.61,
		);
		const wave = 0.5 + 0.5 * primary * (0.68 + 0.32 * secondary);
		const shimmer = Math.pow(Math.max(0, wave), 3.1);
		const alpha = Math.min(
			1,
			star.opacity * (0.38 + wave * 0.62) + shimmer * 0.78,
		);
		const red = Math.round(218 + star.temperature * 35);
		const green = Math.round(232 + star.temperature * 16);
		const coreR = star.radius * (0.88 + shimmer * 0.38);

		if (shimmer > 0.22) {
			const glowR = coreR * (3.6 + shimmer * 3.4);
			ctx.globalAlpha = alpha * (0.2 + shimmer * 0.42);
			ctx.drawImage(
				glowSprite,
				star.x - glowR,
				star.y - glowR,
				glowR * 2,
				glowR * 2,
			);
		}

		ctx.globalAlpha = alpha;
		ctx.fillStyle = `rgba(${red}, ${green}, 255, 1)`;
		ctx.beginPath();
		ctx.arc(star.x, star.y, coreR, 0, Math.PI * 2);
		ctx.fill();

		if (shimmer > 0.45) {
			ctx.globalAlpha = alpha * (0.5 + shimmer * 0.4);
			ctx.fillStyle = 'rgba(255, 255, 255, 1)';
			ctx.beginPath();
			ctx.arc(star.x, star.y, coreR * 0.38, 0, Math.PI * 2);
			ctx.fill();
		}

		if (star.spike && shimmer > 0.32) {
			const spike = coreR * (2.6 + shimmer * 3.4);
			ctx.globalAlpha = alpha * (0.22 + shimmer * 0.38);
			ctx.strokeStyle = `rgba(210, 238, 255, 1)`;
			ctx.lineWidth = 0.45 + shimmer * 0.4;
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
			glow.addColorStop(0.35, 'rgba(120, 190, 255, 0.35)');
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
			if (time - lastDraw >= 1000 / 36) {
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
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', resize);
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
