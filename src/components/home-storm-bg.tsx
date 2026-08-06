import { useEffect, useRef } from 'react';
import { stormState } from '../lib/storm-state';

type RainDrop = {
	x: number;
	y: number;
	depth: number;
	length: number;
	speed: number;
	phase: number;
	sway: number;
	brightness: number;
};

const BASE_DROP_COUNT = 430;
const DROPS_PER_LEVEL = 70;
const MAX_DROP_COUNT = 850;
const MAX_STORM_LEVEL = 6;
const CLEAR_SPEED = 0.0042;
const STORM_RETURN_SPEED = 0.0065;
const random = (min: number, max: number) => min + Math.random() * (max - min);

const createDrop = (width: number, height: number, fromTop = false): RainDrop => {
	const depth = random(0.2, 1);

	return {
		x: random(-width * 0.25, width * 1.1),
		y: fromTop ? random(-height * 0.35, 0) : random(-height * 0.2, height),
		depth,
		length: random(7, 25) * (0.5 + depth * 0.72),
		speed: random(9, 17) * (0.58 + depth * 0.58),
		phase: random(0, Math.PI * 2),
		sway: random(0.25, 1.15),
		brightness: random(0.72, 1),
	};
};

export const HomeStormBg = () => {
	const rootRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const root = rootRef.current;
		const canvas = canvasRef.current;
		if (!root || !canvas) return;

		const context = canvas.getContext('2d');
		if (!context) return;

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		let width = window.innerWidth;
		let height = window.innerHeight;
		let drops: RainDrop[] = [];
		let animationId = 0;
		let lastFrame = performance.now();
		let pointerX = width / 2;
		let pointerY = height / 2;
		let previousPointerX = pointerX;
		let targetWind = 5;
		let cursorWind = 5;
		let cameraX = 0;
		let cameraY = 0;
		let lastPointerAt = 0;
		let stormLevel = 0;
		let targetStormLevel = 0;
		let clearProgress = 0;
		let targetClear = 0;

		const desiredDropCount = () => {
			const stormDrops = Math.min(
				MAX_DROP_COUNT,
				BASE_DROP_COUNT + targetStormLevel * DROPS_PER_LEVEL,
			);
			return Math.round(stormDrops * (1 - clearProgress));
		};

		const resize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			context.setTransform(dpr, 0, 0, dpr, 0, 0);

			const count = Math.max(desiredDropCount(), clearProgress > 0.95 ? 0 : 40);
			drops = Array.from({ length: count }, () => createDrop(width, height));
		};

		const publishStorm = () => {
			const sunny = clearProgress > 0.82;
			stormState.active = clearProgress < 0.97;
			stormState.wind = cursorWind * (1 - clearProgress * 0.85);
			stormState.level = stormLevel * (1 - clearProgress);
			stormState.clear = clearProgress;
			stormState.sunny = sunny;

			root.style.setProperty('--storm-wind', `${stormState.wind}`);
			root.style.setProperty('--storm-level', `${stormState.level}`);
			root.style.setProperty('--storm-clear', `${clearProgress}`);
			root.classList.toggle('home-storm-sunny', sunny);
			document.documentElement.style.setProperty('--storm-wind', `${stormState.wind}`);
			document.documentElement.style.setProperty('--storm-level', `${stormState.level}`);
			document.documentElement.style.setProperty('--storm-clear', `${clearProgress}`);
			document.documentElement.classList.toggle('weather-sunny', sunny);
			document.documentElement.classList.toggle(
				'weather-clearing',
				clearProgress > 0.08 && clearProgress < 0.82,
			);
		};

		const render = (timestamp: number) => {
			const frameStep = Math.min((timestamp - lastFrame) / 16.67, 2);
			lastFrame = timestamp;
			context.clearRect(0, 0, width, height);

			const clearEase =
				targetClear > clearProgress ? CLEAR_SPEED : STORM_RETURN_SPEED;
			clearProgress += (targetClear - clearProgress) * (1 - Math.pow(1 - clearEase * 14, frameStep));
			if (Math.abs(targetClear - clearProgress) < 0.001) {
				clearProgress = targetClear;
			}

			if (timestamp - lastPointerAt > 180) {
				targetWind += ((5 - targetWind) * 0.025 * frameStep);
			}

			if (targetClear > 0.5) {
				targetStormLevel = 0;
				targetWind += (1.2 - targetWind) * 0.02 * frameStep;
			}

			stormLevel +=
				(targetStormLevel - stormLevel) * (1 - Math.pow(0.955, frameStep));
			cursorWind += (targetWind - cursorWind) * (1 - Math.pow(0.945, frameStep));
			publishStorm();

			const targetCameraX = (pointerX / width - 0.5) * 2;
			const targetCameraY = (pointerY / height - 0.5) * 2;
			cameraX += (targetCameraX - cameraX) * 0.035 * frameStep;
			cameraY += (targetCameraY - cameraY) * 0.035 * frameStep;
			root.style.setProperty('--storm-far-x', `${cameraX * -3}px`);
			root.style.setProperty('--storm-far-y', `${cameraY * -1}px`);
			root.style.setProperty('--storm-mid-x', `${cameraX * -9}px`);
			root.style.setProperty('--storm-mid-y', `${cameraY * -3.5}px`);
			root.style.setProperty('--storm-near-x', `${cameraX * -18}px`);
			root.style.setProperty('--storm-near-y', `${cameraY * -7}px`);
			root.style.setProperty('--storm-horizon-x', `${cameraX * -5}px`);
			root.style.setProperty('--storm-horizon-y', `${cameraY * -2.5}px`);
			root.style.setProperty('--storm-tilt-x', `${cameraY * -1.8}deg`);
			root.style.setProperty('--storm-tilt-y', `${cameraX * 2.4}deg`);

			const rainVisibility = Math.max(0, 1 - clearProgress * 1.15);
			canvas.style.opacity = `${rainVisibility * 0.92}`;

			if (rainVisibility <= 0.02) {
				drops.length = 0;
			} else {
				const targetCount = desiredDropCount();
				while (drops.length > targetCount) {
					drops.pop();
				}

				const gust =
					Math.sin(timestamp * 0.00038) * 3.2 +
					Math.sin(timestamp * 0.00091 + 1.7) * 1.6;

				context.lineCap = 'round';
				context.globalAlpha = rainVisibility;

				for (const drop of drops) {
					const localAir =
						Math.sin(timestamp * 0.0012 + drop.phase) * drop.sway;
					const stormSpeed = (1 + stormLevel * 0.13) * (0.55 + rainVisibility * 0.45);
					const stormWind = 1 + stormLevel * 0.055;
					const wind =
						(cursorWind + gust + localAir) *
						(0.34 + drop.depth * 0.72) *
						stormWind *
						(1 - clearProgress * 0.7);
					const fall = drop.speed * frameStep * stormSpeed;
					const drift = wind * frameStep;
					const visibleLength = drop.length * (1 + stormLevel * 0.045);
					const tailX = drop.x - wind * (visibleLength / drop.speed) * 0.62;
					const tailY = drop.y - visibleLength;
					const opacity =
						(0.08 + drop.depth * 0.38) *
						drop.brightness *
						Math.min(1.35, 1 + stormLevel * 0.055);

					context.beginPath();
					context.moveTo(tailX, tailY);
					context.lineTo(drop.x, drop.y);
					context.lineWidth = 0.35 + drop.depth * 0.78;
					context.strokeStyle = `rgba(194, 220, 231, ${opacity})`;
					context.stroke();

					if (drop.depth > 0.78) {
						context.beginPath();
						context.moveTo(
							drop.x - (drop.x - tailX) * 0.18,
							drop.y - visibleLength * 0.18,
						);
						context.lineTo(drop.x, drop.y);
						context.lineWidth = 0.45;
						context.strokeStyle = `rgba(232, 246, 251, ${opacity * 0.72})`;
						context.stroke();
					}

					drop.x += drift;
					drop.y += fall;

					if (
						drop.y - drop.length > height ||
						drop.x > width * 1.25 ||
						drop.x < -width * 0.35
					) {
						if (Math.random() > rainVisibility * 0.85) {
							continue;
						}
						Object.assign(drop, createDrop(width, height, true));
						drop.x =
							wind >= 0
								? random(-width * 0.35, width)
								: random(0, width * 1.25);
					}
				}

				context.globalAlpha = 1;
			}

			if (!reducedMotion.matches) {
				animationId = requestAnimationFrame(render);
			}
		};

		const handleMotionPreference = () => {
			cancelAnimationFrame(animationId);
			lastFrame = performance.now();
			render(lastFrame);
		};

		const handlePointerMove = (event: PointerEvent) => {
			pointerX = event.clientX;
			pointerY = event.clientY;
			const movement = event.clientX - previousPointerX;
			previousPointerX = event.clientX;
			lastPointerAt = performance.now();

			if (Math.abs(movement) > 0.2 && clearProgress < 0.6) {
				targetWind = Math.max(-20, Math.min(20, movement * 1.35));
			}
		};

		const settleWind = () => {
			targetWind = clearProgress > 0.5 ? 1.2 : 5;
		};

		const strengthenStorm = (event: PointerEvent) => {
			if (event.button !== 0) return;

			if (targetClear > 0.2) {
				targetClear = 0;
				targetStormLevel = Math.max(1, targetStormLevel);
				const count = Math.min(
					MAX_DROP_COUNT,
					BASE_DROP_COUNT + targetStormLevel * DROPS_PER_LEVEL,
				);
				while (drops.length < Math.round(count * 0.45)) {
					drops.push(createDrop(width, height, true));
				}
				return;
			}

			if (targetStormLevel >= MAX_STORM_LEVEL) return;

			targetStormLevel += 1;
			const targetDropCount = Math.min(
				MAX_DROP_COUNT,
				BASE_DROP_COUNT + targetStormLevel * DROPS_PER_LEVEL,
			);

			while (drops.length < targetDropCount) {
				drops.push(createDrop(width, height, true));
			}
		};

		const clearWeather = (event: PointerEvent) => {
			if (event.button !== 2) return;
			targetClear = 1;
			targetStormLevel = 0;
			targetWind = 1.2;
		};

		const preventMenu = (event: MouseEvent) => {
			event.preventDefault();
		};

		resize();
		render(lastFrame);
		window.addEventListener('resize', resize);
		window.addEventListener('pointermove', handlePointerMove, { passive: true });
		window.addEventListener('pointerleave', settleWind);
		window.addEventListener('pointerdown', strengthenStorm, { passive: true });
		window.addEventListener('pointerdown', clearWeather, { passive: true });
		window.addEventListener('contextmenu', preventMenu);
		reducedMotion.addEventListener('change', handleMotionPreference);

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', resize);
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerleave', settleWind);
			window.removeEventListener('pointerdown', strengthenStorm);
			window.removeEventListener('pointerdown', clearWeather);
			window.removeEventListener('contextmenu', preventMenu);
			reducedMotion.removeEventListener('change', handleMotionPreference);
			stormState.active = false;
			stormState.wind = 5;
			stormState.level = 0;
			stormState.clear = 0;
			stormState.sunny = false;
			document.documentElement.classList.remove('weather-sunny', 'weather-clearing');
			document.documentElement.style.removeProperty('--storm-clear');
		};
	}, []);

	return (
		<div
			ref={rootRef}
			className='home-storm'
			aria-hidden='true'
		>
			<span className='home-storm-sun-sky' />
			<span className='home-storm-sun-glow' />
			<span className='home-storm-sun-rays' />
			<span className='home-storm-clouds home-storm-clouds-far' />
			<span className='home-storm-clouds home-storm-clouds-mid' />
			<span className='home-storm-clouds home-storm-clouds-near' />
			<span className='home-storm-horizon' />
			<span className='home-storm-lightning' />
			<span className='home-storm-haze' />
			<canvas
				ref={canvasRef}
				className='home-storm-rain'
			/>
			<span className='home-storm-surface-mist' />
			<span className='home-storm-warm-haze' />
			<span className='home-storm-vignette' />
		</div>
	);
};
