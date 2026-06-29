import { useEffect, useRef } from 'react';
import {
	drawScrollComet,
	drawSparks,
	tickSparks,
	type Spark,
} from '../lib/scroll-comet-fx';

const CANVAS_W = 56;
const EDGE_PAD = 38;
const HEAD_INSET = 24;

export const ScrollBar = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const progressRef = useRef(0);
	const velocityRef = useRef(0);
	const sparksRef = useRef<Spark[]>([]);
	const smoothYRef = useRef(EDGE_PAD);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const width = CANVAS_W;
		let height = window.innerHeight;
		let rafId = 0;
		let lastScrollY = window.scrollY;
		let lastTime = performance.now();

		const resize = () => {
			height = window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const updateProgress = (now: number) => {
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			const next = docHeight > 0 ? window.scrollY / docHeight : 0;
			progressRef.current = Math.min(1, Math.max(0, next));

			const dt = Math.max(now - lastTime, 1);
			const scrollDelta = Math.abs(window.scrollY - lastScrollY);
			const instant = Math.min(1.2, scrollDelta / dt);
			velocityRef.current = velocityRef.current * 0.82 + instant * 0.18;
			lastScrollY = window.scrollY;
			lastTime = now;
		};

		const render = (timestamp: number) => {
			updateProgress(timestamp);

			const progress = progressRef.current;
			const targetY = EDGE_PAD + progress * (height - EDGE_PAD * 2);
			smoothYRef.current += (targetY - smoothYRef.current) * 0.16;
			const headY = smoothYRef.current;
			const headX = width - HEAD_INSET;
			const brightness = Math.min(
				1.15,
				0.82 + velocityRef.current * 0.65,
			);

			ctx.clearRect(0, 0, width, height);

			drawScrollComet(
				ctx,
				headX,
				headY,
				width,
				height,
				progress,
				brightness,
				timestamp,
			);
			tickSparks(sparksRef.current, headX, headY, velocityRef.current);
			drawSparks(ctx, sparksRef.current);

			velocityRef.current *= 0.96;

			rafId = requestAnimationFrame(render);
		};

		resize();
		window.addEventListener('resize', resize);
		rafId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className='scroll-comet-canvas'
			aria-hidden='true'
		/>
	);
};
