import { useEffect, useRef } from 'react';
import {
	getCometPointer,
	segmentHitsCometPointer,
	triggerCometImpact,
} from '../lib/comet-pointer';
import {
	drawMeteor,
	spawnMeteor,
	spawnMeteorBurst,
	type Meteor,
} from '../lib/meteor-fx';

type Star = {
	x: number;
	y: number;
	size: number;
	baseOpacity: number;
	twinkleSpeed: number;
	twinkleOffset: number;
	shimmerSpeed: number;
	shimmerOffset: number;
	driftX: number;
	driftY: number;
	depth: number;
	warmth: number;
};

const STAR_COUNT = 220;
const MAX_METEORS = 10;
const SKY_TOP = '#04060c';
const SKY_MID = '#020308';
const SKY_BOTTOM = '#000000';

const random = (min: number, max: number) => min + Math.random() * (max - min);

const createStars = (width: number, height: number): Star[] =>
	Array.from({ length: STAR_COUNT }, () => {
		const depth = random(0.35, 1);
		return {
			x: Math.random() * width,
			y: Math.random() * height,
			size: random(0.35, 1.8) * depth + random(0, 0.4),
			baseOpacity: random(0.35, 0.95) * (0.5 + depth * 0.5),
			twinkleSpeed: random(0.3, 1.2) * depth,
			twinkleOffset: random(0, Math.PI * 2),
			shimmerSpeed: random(0.08, 0.24),
			shimmerOffset: random(0, Math.PI * 2),
			driftX: random(-0.55, 0.55) * depth,
			driftY: random(-0.3, 0.3) * depth,
			depth,
			warmth: random(0, 1),
		};
	}).sort((a, b) => a.depth - b.depth);

const starColor = (warmth: number, alpha: number) => {
	const r = Math.round(235 + warmth * 20);
	const g = Math.round(242 + warmth * 8);
	const b = 255;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const GLOW_SPRITE_SIZE = 64;

const createGlowSprite = () => {
	const sprite = document.createElement('canvas');
	sprite.width = GLOW_SPRITE_SIZE;
	sprite.height = GLOW_SPRITE_SIZE;

	const ctx = sprite.getContext('2d');
	if (!ctx) return sprite;

	const mid = GLOW_SPRITE_SIZE / 2;
	const grad = ctx.createRadialGradient(mid, mid, 0, mid, mid, mid);
	grad.addColorStop(0, 'rgba(245, 249, 255, 0.35)');
	grad.addColorStop(0.45, 'rgba(100, 170, 255, 0.12)');
	grad.addColorStop(1, 'rgba(31, 120, 220, 0)');
	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, GLOW_SPRITE_SIZE, GLOW_SPRITE_SIZE);

	return sprite;
};

export const FallingStarsLayer = () => {
	const meteorCanvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const meteorCanvas = meteorCanvasRef.current;
		if (!meteorCanvas) return;

		const meteorCtx = meteorCanvas.getContext('2d');
		if (!meteorCtx) return;

		let width = window.innerWidth;
		let height = window.innerHeight;
		let meteors: Meteor[] = [];
		let meteorAnimId = 0;
		let lastSpawn = 0;
		let lastFrame = 0;
		let nextSpawnIn = random(700, 1400);

		const resize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);

			meteorCanvas.width = width * dpr;
			meteorCanvas.height = height * dpr;
			meteorCanvas.style.width = `${width}px`;
			meteorCanvas.style.height = `${height}px`;
			meteorCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
			meteors = [spawnMeteor(width, height), spawnMeteor(width, height)];
			lastSpawn = performance.now();
			lastFrame = lastSpawn;
		};

		const renderMeteors = (timestamp: number) => {
			const dt = Math.min((timestamp - lastFrame) / 16.67, 2);
			lastFrame = timestamp;

			if (timestamp - lastSpawn > nextSpawnIn && meteors.length < MAX_METEORS) {
				meteors.push(spawnMeteor(width, height));
				lastSpawn = timestamp;
				nextSpawnIn = random(650, 1300);
			}

			meteorCtx.clearRect(0, 0, width, height);

			const pointer = getCometPointer();

			meteors = meteors.filter((meteor) => {
				const prevX = meteor.x;
				const prevY = meteor.y;
				meteor.x += meteor.vx * dt;
				meteor.y += meteor.vy * dt;

				const collided =
					pointer.active &&
					!pointer.hidden &&
					segmentHitsCometPointer(prevX, prevY, meteor.x, meteor.y, 4);

				if (collided) {
					spawnMeteorBurst(meteor, pointer.x, pointer.y);
					triggerCometImpact();
					return false;
				}

				const onScreen =
					meteor.x > -meteor.length &&
					meteor.x < width + meteor.length &&
					meteor.y > -meteor.length &&
					meteor.y < height + meteor.length;

				if (onScreen) drawMeteor(meteorCtx, meteor);
				return onScreen;
			});

			meteorAnimId = requestAnimationFrame(renderMeteors);
		};

		resize();
		window.addEventListener('resize', resize);
		meteorAnimId = requestAnimationFrame(renderMeteors);

		return () => {
			window.removeEventListener('resize', resize);
			cancelAnimationFrame(meteorAnimId);
		};
	}, []);

	return (
		<canvas
			ref={meteorCanvasRef}
			className='falling-stars-canvas'
			aria-hidden='true'
		/>
	);
};

export const StarfieldBg = () => {
	const skyCanvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const skyCanvas = skyCanvasRef.current;
		if (!skyCanvas) return;

		const skyCtx = skyCanvas.getContext('2d');
		if (!skyCtx) return;

		let width = window.innerWidth;
		let height = window.innerHeight;
		let stars: Star[] = createStars(width, height);
		let skyAnimId = 0;

		const glowSprite = createGlowSprite();
		const backdrop = document.createElement('canvas');
		const backdropCtx = backdrop.getContext('2d');

		// The sky gradient and nebulae never change, so they are rasterised once
		// per resize and blitted each frame instead of being rebuilt.
		const buildBackdrop = (dpr: number) => {
			if (!backdropCtx) return;

			backdrop.width = Math.round(width * dpr);
			backdrop.height = Math.round(height * dpr);
			backdropCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

			const grad = backdropCtx.createLinearGradient(0, 0, 0, height);
			grad.addColorStop(0, SKY_TOP);
			grad.addColorStop(0.42, SKY_MID);
			grad.addColorStop(1, SKY_BOTTOM);
			backdropCtx.fillStyle = grad;
			backdropCtx.fillRect(0, 0, width, height);

			const nebulaA = backdropCtx.createRadialGradient(
				width * 0.18,
				height * 0.08,
				0,
				width * 0.18,
				height * 0.08,
				width * 0.38,
			);
			nebulaA.addColorStop(0, 'rgba(25, 70, 130, 0.045)');
			nebulaA.addColorStop(0.55, 'rgba(40, 50, 110, 0.025)');
			nebulaA.addColorStop(1, 'transparent');

			const nebulaB = backdropCtx.createRadialGradient(
				width * 0.78,
				height * 0.15,
				0,
				width * 0.78,
				height * 0.15,
				width * 0.42,
			);
			nebulaB.addColorStop(0, 'rgba(60, 40, 110, 0.035)');
			nebulaB.addColorStop(0.5, 'rgba(30, 80, 140, 0.02)');
			nebulaB.addColorStop(1, 'transparent');

			backdropCtx.fillStyle = nebulaA;
			backdropCtx.fillRect(0, 0, width, height);
			backdropCtx.fillStyle = nebulaB;
			backdropCtx.fillRect(0, 0, width, height);
		};

		const resize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);

			skyCanvas.width = width * dpr;
			skyCanvas.height = height * dpr;
			skyCanvas.style.width = `${width}px`;
			skyCanvas.style.height = `${height}px`;
			skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
			stars = createStars(width, height);
			buildBackdrop(dpr);
		};

		const drawSky = () => {
			skyCtx.drawImage(backdrop, 0, 0, width, height);
		};

		const drawStarPoint = (star: Star, x: number, y: number, alpha: number) => {
			skyCtx.beginPath();
			skyCtx.arc(x, y, star.size, 0, Math.PI * 2);
			skyCtx.fillStyle = starColor(star.warmth, alpha);
			skyCtx.fill();
		};

		const drawStarGlow = (
			star: Star,
			x: number,
			y: number,
			alpha: number,
		) => {
			if (star.size < 0.85 || alpha < 0.3) return;

			const radius = star.size * 3.2;
			skyCtx.globalAlpha = alpha;
			skyCtx.drawImage(
				glowSprite,
				x - radius,
				y - radius,
				radius * 2,
				radius * 2,
			);
			skyCtx.globalAlpha = 1;
		};

		const drawStaticStars = (t: number) => {
			const elapsed = t * 0.001;

			for (const star of stars) {
				const x = ((star.x + elapsed * star.driftX) % width + width) % width;
				const y = ((star.y + elapsed * star.driftY) % height + height) % height;
				const twinkle =
					0.58 +
					0.42 * Math.sin(t * star.twinkleSpeed * 0.001 + star.twinkleOffset);
				const shimmer = Math.pow(
					Math.max(
						0,
						Math.sin(
							t * star.shimmerSpeed * 0.001 + star.shimmerOffset,
						),
					),
					18,
				);
				const alpha = Math.min(
					star.baseOpacity * twinkle + shimmer * 0.55,
					1,
				);

				drawStarGlow(star, x, y, alpha);
				drawStarPoint(star, x, y, alpha);

				if (star.size > 1.25 && alpha > 0.55) {
					const spike = star.size * (2.8 + shimmer * 1.8);
					skyCtx.strokeStyle = `rgba(200, 230, 255, ${alpha * 0.22})`;
					skyCtx.lineWidth = 0.5;
					skyCtx.beginPath();
					skyCtx.moveTo(x - spike, y);
					skyCtx.lineTo(x + spike, y);
					skyCtx.moveTo(x, y - spike);
					skyCtx.lineTo(x, y + spike);
					skyCtx.stroke();
				}
			}
		};

		const renderSky = (timestamp: number) => {
			drawSky();
			drawStaticStars(timestamp);
			skyAnimId = requestAnimationFrame(renderSky);
		};

		resize();
		window.addEventListener('resize', resize);
		skyAnimId = requestAnimationFrame(renderSky);

		return () => {
			window.removeEventListener('resize', resize);
			cancelAnimationFrame(skyAnimId);
		};
	}, []);

	return (
		<canvas
			ref={skyCanvasRef}
			className='starfield-canvas'
			aria-hidden='true'
		/>
	);
};
