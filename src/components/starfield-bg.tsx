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
			depth,
			warmth: random(0, 1),
		};
	});

const starColor = (warmth: number, alpha: number) => {
	const r = Math.round(235 + warmth * 20);
	const g = Math.round(242 + warmth * 8);
	const b = 255;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
		};

		const drawSky = () => {
			const grad = skyCtx.createLinearGradient(0, 0, 0, height);
			grad.addColorStop(0, SKY_TOP);
			grad.addColorStop(0.42, SKY_MID);
			grad.addColorStop(1, SKY_BOTTOM);
			skyCtx.fillStyle = grad;
			skyCtx.fillRect(0, 0, width, height);

			const nebulaA = skyCtx.createRadialGradient(
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

			const nebulaB = skyCtx.createRadialGradient(
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

			skyCtx.fillStyle = nebulaA;
			skyCtx.fillRect(0, 0, width, height);
			skyCtx.fillStyle = nebulaB;
			skyCtx.fillRect(0, 0, width, height);
		};

		const drawStarPoint = (star: Star, alpha: number) => {
			skyCtx.beginPath();
			skyCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
			skyCtx.fillStyle = starColor(star.warmth, alpha);
			skyCtx.fill();
		};

		const drawStarGlow = (star: Star, alpha: number) => {
			if (star.size < 0.85 || alpha < 0.3) return;

			const glow = skyCtx.createRadialGradient(
				star.x,
				star.y,
				0,
				star.x,
				star.y,
				star.size * 3.2,
			);
			glow.addColorStop(0, starColor(star.warmth, alpha * 0.35));
			glow.addColorStop(0.45, `rgba(100, 170, 255, ${alpha * 0.12})`);
			glow.addColorStop(1, 'rgba(31, 120, 220, 0)');

			skyCtx.fillStyle = glow;
			skyCtx.beginPath();
			skyCtx.arc(star.x, star.y, star.size * 3.2, 0, Math.PI * 2);
			skyCtx.fill();
		};

		const drawStaticStars = (t: number) => {
			const sorted = [...stars].sort((a, b) => a.depth - b.depth);

			for (const star of sorted) {
				const twinkle =
					0.58 +
					0.42 * Math.sin(t * star.twinkleSpeed * 0.001 + star.twinkleOffset);
				const alpha = Math.min(star.baseOpacity * twinkle, 1);

				drawStarGlow(star, alpha);
				drawStarPoint(star, alpha);

				if (star.size > 1.25 && alpha > 0.55) {
					skyCtx.save();
					skyCtx.strokeStyle = `rgba(200, 230, 255, ${alpha * 0.22})`;
					skyCtx.lineWidth = 0.5;
					const spike = star.size * 2.8;
					skyCtx.beginPath();
					skyCtx.moveTo(star.x - spike, star.y);
					skyCtx.lineTo(star.x + spike, star.y);
					skyCtx.moveTo(star.x, star.y - spike);
					skyCtx.lineTo(star.x, star.y + spike);
					skyCtx.stroke();
					skyCtx.restore();
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
