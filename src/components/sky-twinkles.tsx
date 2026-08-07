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

type SkyTwinklesProps = {
	/** Approximate star count (scaled to viewport). */
	density?: number;
	/** Upper sky band fraction (0–1). */
	skyBand?: number;
	className?: string;
};

/**
 * Shared realistic twinkling starfield for page skies.
 * Many small pinpoints + fewer bright flashing heroes.
 */
export const SkyTwinkles = ({
	density = 90,
	skyBand = 0.62,
	className = 'sky-twinkles-canvas',
}: SkyTwinklesProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d', {
			alpha: true,
			desynchronized: true,
		});
		if (!ctx) return;

		const glowSprite = document.createElement('canvas');
		glowSprite.width = 48;
		glowSprite.height = 48;
		const gctx = glowSprite.getContext('2d');
		if (gctx) {
			const glow = gctx.createRadialGradient(24, 24, 0, 24, 24, 24);
			glow.addColorStop(0, 'rgba(245, 250, 255, 1)');
			glow.addColorStop(0.3, 'rgba(170, 215, 255, 0.4)');
			glow.addColorStop(0.65, 'rgba(90, 160, 240, 0.1)');
			glow.addColorStop(1, 'rgba(60, 120, 200, 0)');
			gctx.fillStyle = glow;
			gctx.fillRect(0, 0, 48, 48);
		}

		const reducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;

		let width = window.innerWidth;
		let height = window.innerHeight;
		let stars: SkyStar[] = [];
		let rafId = 0;
		let lastDraw = 0;

		const createStars = () => {
			const area = width * height;
			const count = Math.min(
				160,
				Math.max(density, Math.round((area / 14000) * (density / 90))),
			);
			const skyH = height * skyBand;
			return Array.from({ length: count }, () => {
				const bright = Math.random() > 0.82;
				const mid = !bright && Math.random() > 0.55;
				return {
					x: Math.random() * width,
					y: Math.random() ** 1.15 * skyH,
					radius: bright
						? random(0.7, 1.25)
						: mid
							? random(0.4, 0.75)
							: random(0.18, 0.45),
					opacity: bright
						? random(0.45, 0.78)
						: mid
							? random(0.28, 0.52)
							: random(0.16, 0.38),
					twinkleSpeed: bright
						? random(2.2, 4.8)
						: random(1.4, 3.6),
					phase: random(0, Math.PI * 2),
					temperature: random(0.05, 0.7),
					spike: bright,
				};
			});
		};

		const resize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			stars = createStars();
		};

		const paint = (time: number) => {
			ctx.clearRect(0, 0, width, height);
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
				const red = Math.round(220 + star.temperature * 32);
				const green = Math.round(234 + star.temperature * 14);
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
					const arm = coreR * (2.6 + shimmer * 3.4);
					ctx.globalAlpha = alpha * (0.22 + shimmer * 0.38);
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

		const render = (time: number) => {
			if (time - lastDraw >= 1000 / 36) {
				lastDraw = time;
				paint(time);
			}
			if (!reducedMotion) {
				rafId = requestAnimationFrame(render);
			}
		};

		resize();
		paint(performance.now());
		window.addEventListener('resize', resize);
		rafId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
		};
	}, [density, skyBand]);

	return (
		<canvas
			ref={canvasRef}
			className={className}
			aria-hidden='true'
		/>
	);
};
