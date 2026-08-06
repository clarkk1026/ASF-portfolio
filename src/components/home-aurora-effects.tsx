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
/** Stars only in the clear dark sky (left). */
const STAR_UV = { bottom: 0.4, right: 0.55 };

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
	Array.from({ length: 140 }, () => ({
		ux: Math.random() * STAR_UV.right,
		uy: Math.random() ** 1.4 * STAR_UV.bottom,
		r: rand(0.4, 1.05),
		base: rand(0.4, 0.9),
		speed: rand(0.6, 1.9),
		phase: rand(0, Math.PI * 2),
	}));

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

	for (const star of stars) {
		const { x, y } = uvToScreen(cover, star.ux, star.uy);
		if (y > skyBottom || x > skyRight) continue;

		const wave = 0.5 + 0.5 * Math.sin(time * 0.001 * star.speed + star.phase);
		const spark = Math.pow(wave, 14);
		const alpha = clamp(star.base * (0.6 + wave * 0.3) + spark * 0.5, 0.15, 1);
		const r = star.r * (0.92 + spark * 0.2);

		ctx.globalAlpha = alpha;
		ctx.fillStyle = '#f2f7ff';
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();

		if (spark > 0.78 && star.r > 0.8) {
			ctx.globalAlpha = alpha * 0.5;
			ctx.fillRect(x - r * 2, y - 0.35, r * 4, 0.7);
			ctx.fillRect(x - 0.35, y - r * 2, 0.7, r * 4);
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
		img.src = '/home-aurora-team-4k.webp';

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
