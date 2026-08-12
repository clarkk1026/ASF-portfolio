import { useEffect, useRef } from 'react';

type Cover = {
	x: number;
	y: number;
	w: number;
	h: number;
};

type Star = {
	ux: number;
	uy: number;
	r: number;
	base: number;
	speed: number;
	phase: number;
};

/** Match CSS: object-fit cover + object-position center bottom */
const POS = { x: 0.5, y: 1 };
/** Stars in the clear dark night sky band above the team. */
const STAR_UV = { bottom: 0.52, right: 0.72 };

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const coverRect = (
	imgW: number,
	imgH: number,
	viewW: number,
	viewH: number,
	posX: number,
	posY: number,
): Cover => {
	const scale = Math.max(viewW / imgW, viewH / imgH);
	const w = imgW * scale;
	const h = imgH * scale;
	return {
		x: (viewW - w) * posX,
		y: (viewH - h) * posY,
		w,
		h,
	};
};

const uvToScreen = (cover: Cover, ux: number, uy: number) => ({
	x: cover.x + ux * cover.w,
	y: cover.y + uy * cover.h,
});

const createStars = (): Star[] =>
	Array.from({ length: 48 }, () => {
		const bright = Math.random() > 0.86;
		return {
			ux: Math.random() * STAR_UV.right,
			uy: Math.random() ** 1.25 * STAR_UV.bottom,
			r: bright ? rand(0.7, 1.25) : rand(0.28, 0.9),
			base: bright ? rand(0.55, 0.95) : rand(0.32, 0.72),
			speed: bright ? rand(2.4, 5.0) : rand(1.5, 3.8),
			phase: rand(0, Math.PI * 2),
		};
	});

/** Crisp star twinkles in dark sky only — no image redraw (avoids seams). */
const drawStars = (
	ctx: CanvasRenderingContext2D,
	stars: Star[],
	cover: Cover,
	time: number,
) => {
	const skyBottom = cover.y + STAR_UV.bottom * cover.h;
	const skyRight = cover.x + STAR_UV.right * cover.w;

	ctx.save();
	ctx.beginPath();
	ctx.rect(cover.x, cover.y, skyRight - cover.x, skyBottom - cover.y);
	ctx.clip();
	ctx.globalCompositeOperation = 'lighter';

	for (const star of stars) {
		const { x, y } = uvToScreen(cover, star.ux, star.uy);
		if (y > skyBottom || x > skyRight || x < cover.x) continue;

		const t = time * 0.001;
		const wave =
			0.5 +
			0.5 *
				Math.sin(t * star.speed + star.phase) *
				(0.7 + 0.3 * Math.sin(t * star.speed * 1.7 + star.phase * 0.5));
		const spark = Math.pow(Math.max(0, wave), 3.1);
		const alpha = clamp(
			star.base * (0.36 + wave * 0.64) + spark * 0.78,
			0.16,
			1,
		);
		const r = star.r * (0.88 + spark * 0.36);

		ctx.globalAlpha = alpha;
		ctx.fillStyle = '#f2f7ff';
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();

		if (spark > 0.4 && star.r > 0.55) {
			ctx.globalAlpha = alpha * (0.42 + spark * 0.35);
			ctx.fillRect(x - r * 2.4, y - 0.35, r * 4.8, 0.7);
			ctx.fillRect(x - 0.35, y - r * 2.4, 0.7, r * 4.8);
		}
	}

	ctx.restore();
};

export const HomeAuroraEffects = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d', { alpha: true });
		if (!ctx) return;

		const img = new Image();
		img.decoding = 'async';
		img.src = '/home-aurora-team-4k.webp?v=original';

		const reducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;

		let width = window.innerWidth;
		let height = window.innerHeight;
		let cover: Cover | null = null;
		const stars = createStars();
		let animationId = 0;
		let lastDraw = 0;
		let ready = false;

		const syncCover = () => {
			if (!img.naturalWidth) return;
			cover = coverRect(
				img.naturalWidth,
				img.naturalHeight,
				width,
				height,
				POS.x,
				POS.y,
			);
		};

		const resize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			syncCover();
		};

		const paint = (time: number) => {
			if (!cover || !ready) return;
			ctx.clearRect(0, 0, width, height);
			drawStars(ctx, stars, cover, time);
		};

		const render = (time: number) => {
			if (reducedMotion) {
				paint(0);
				return;
			}
			if (time - lastDraw >= 1000 / 26) {
				lastDraw = time;
				paint(time);
			}
			animationId = requestAnimationFrame(render);
		};

		const onReady = () => {
			ready = true;
			resize();
			cancelAnimationFrame(animationId);
			animationId = requestAnimationFrame(render);
		};

		if (img.complete && img.naturalWidth > 0) onReady();
		else {
			img.addEventListener('load', onReady, { once: true });
			img.addEventListener(
				'error',
				() => {
					ready = true;
					resize();
					animationId = requestAnimationFrame(render);
				},
				{ once: true },
			);
		}

		window.addEventListener('resize', resize);

		return () => {
			window.removeEventListener('resize', resize);
			cancelAnimationFrame(animationId);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className='home-aurora-effects'
			aria-hidden='true'
		/>
	);
};
