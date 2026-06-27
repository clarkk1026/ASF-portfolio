import { useEffect, useRef } from 'react';

type Star = {
	x: number;
	y: number;
	size: number;
	baseOpacity: number;
	twinkleSpeed: number;
	twinkleOffset: number;
};

type Meteor = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	length: number;
};

const STAR_COUNT = 180;
const MAX_METEORS = 10;
const SKY_TOP = '#030508';
const SKY_MID = '#010102';
const SKY_BOTTOM = '#000000';

const random = (min: number, max: number) => min + Math.random() * (max - min);

const createStars = (width: number, height: number): Star[] =>
	Array.from({ length: STAR_COUNT }, () => ({
		x: Math.random() * width,
		y: Math.random() * height,
		size: random(0.5, 2.2),
		baseOpacity: random(0.4, 1),
		twinkleSpeed: random(0.4, 1.4),
		twinkleOffset: random(0, Math.PI * 2),
	}));

const spawnMeteor = (width: number, height: number): Meteor => {
	const speed = random(10, 18);
	const angle = Math.PI / 4 + random(-0.12, 0.12);

	return {
		x: random(width * 0.05, width * 0.95),
		y: random(-120, height * 0.35),
		vx: Math.cos(angle) * speed,
		vy: Math.sin(angle) * speed,
		length: random(140, 260),
	};
};

const drawMeteor = (ctx: CanvasRenderingContext2D, meteor: Meteor) => {
	const speed = Math.hypot(meteor.vx, meteor.vy) || 1;
	const dirX = meteor.vx / speed;
	const dirY = meteor.vy / speed;
	const tailX = meteor.x - dirX * meteor.length;
	const tailY = meteor.y - dirY * meteor.length;

	const streak = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
	streak.addColorStop(0, 'rgba(125, 211, 252, 0)');
	streak.addColorStop(0.35, 'rgba(125, 211, 252, 0.45)');
	streak.addColorStop(0.75, 'rgba(255, 255, 255, 0.95)');
	streak.addColorStop(1, 'rgba(255, 255, 255, 1)');

	ctx.save();
	ctx.shadowColor = 'rgba(125, 211, 252, 1)';
	ctx.shadowBlur = 16;
	ctx.strokeStyle = streak;
	ctx.lineWidth = 3;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(tailX, tailY);
	ctx.lineTo(meteor.x, meteor.y);
	ctx.stroke();

	ctx.shadowBlur = 20;
	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.arc(meteor.x, meteor.y, 3.5, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
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
		let nextSpawnIn = random(600, 1400);

		const resize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);

			meteorCanvas.width = width * dpr;
			meteorCanvas.height = height * dpr;
			meteorCanvas.style.width = `${width}px`;
			meteorCanvas.style.height = `${height}px`;
			meteorCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
			meteors = Array.from({ length: 3 }, () => spawnMeteor(width, height));
			lastSpawn = performance.now();
		};

		const renderMeteors = (timestamp: number) => {
			if (timestamp - lastSpawn > nextSpawnIn && meteors.length < MAX_METEORS) {
				meteors.push(spawnMeteor(width, height));
				lastSpawn = timestamp;
				nextSpawnIn = random(500, 1200);
			}

			meteorCtx.clearRect(0, 0, width, height);

			meteors = meteors.filter((meteor) => {
				meteor.x += meteor.vx;
				meteor.y += meteor.vy;
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
			grad.addColorStop(0.45, SKY_MID);
			grad.addColorStop(1, SKY_BOTTOM);
			skyCtx.fillStyle = grad;
			skyCtx.fillRect(0, 0, width, height);

			const nebula = skyCtx.createRadialGradient(
				width * 0.72,
				height * 0.12,
				0,
				width * 0.72,
				height * 0.12,
				width * 0.45,
			);
			nebula.addColorStop(0, 'rgba(20, 60, 120, 0.035)');
			nebula.addColorStop(0.5, 'rgba(50, 40, 100, 0.02)');
			nebula.addColorStop(1, 'transparent');
			skyCtx.fillStyle = nebula;
			skyCtx.fillRect(0, 0, width, height);
		};

		const drawStaticStars = (t: number) => {
			for (const star of stars) {
				const twinkle =
					0.65 +
					0.35 *
						Math.sin(t * star.twinkleSpeed * 0.001 + star.twinkleOffset);
				const alpha = Math.min(star.baseOpacity * twinkle, 1);

				skyCtx.beginPath();
				skyCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
				skyCtx.fillStyle = `rgba(245, 250, 255, ${alpha})`;
				skyCtx.fill();

				if (star.size > 0.9 && alpha > 0.35) {
					skyCtx.beginPath();
					skyCtx.arc(star.x, star.y, star.size * 2.4, 0, Math.PI * 2);
					skyCtx.fillStyle = `rgba(160, 210, 255, ${alpha * 0.2})`;
					skyCtx.fill();
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
