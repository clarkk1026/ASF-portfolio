import { useEffect, useRef } from 'react';
import {
	drawScrollComet,
	drawSparks,
	scrollProgressFromClientY,
	scrollToProgress,
	tickSparks,
	type Spark,
} from '../lib/scroll-comet-fx';
import { updateScrollCometPointer, isNearScrollCometPointer } from '../lib/scroll-comet-pointer';

const CANVAS_W = 64;
const EDGE_PAD = 38;
const HEAD_INSET = 24;

const smoothStep = (
	current: number,
	target: number,
	speed: number,
	dtMs: number,
) => {
	const t = 1 - Math.exp(-speed * (dtMs / 1000));
	return current + (target - current) * t;
};

export const ScrollBar = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const progressRef = useRef(0);
	const dragTargetRef = useRef(0);
	const velocityRef = useRef(0);
	const scrollDirRef = useRef(0);
	const sparksRef = useRef<Spark[]>([]);
	const smoothYRef = useRef(EDGE_PAD);
	const draggingRef = useRef(false);
	const lastProgressRef = useRef(0);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const width = CANVAS_W;
		let height = window.innerHeight;
		let canvasLeft = window.innerWidth - width;
		let rafId = 0;
		let lastScrollY = window.scrollY;
		let lastFrameTime = performance.now();

		const resize = () => {
			height = window.innerHeight;
			canvasLeft = window.innerWidth - width;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const headYFromProgress = (progress: number) =>
			EDGE_PAD + progress * (height - EDGE_PAD * 2);

		const progressFromPointer = (clientY: number) => {
			const rect = canvas.getBoundingClientRect();
			return scrollProgressFromClientY(
				clientY,
				rect.top,
				height,
				EDGE_PAD,
			);
		};

		const syncProgressFromScroll = () => {
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			const next = docHeight > 0 ? window.scrollY / docHeight : 0;
			progressRef.current = Math.min(1, Math.max(0, next));
		};

		const onPointerDown = (e: PointerEvent) => {
			e.preventDefault();
			const target = progressFromPointer(e.clientY);
			const nextHeadY = headYFromProgress(target);
			const alreadyOnHead = isNearScrollCometPointer(
				e.clientX,
				e.clientY,
			);

			draggingRef.current = true;
			document.body.classList.add('scroll-comet-dragging');
			canvas.setPointerCapture(e.pointerId);
			dragTargetRef.current = target;
			progressRef.current = target;
			scrollToProgress(target);

			// Only snap head under the pointer when already inside the 2mm handoff zone.
			if (alreadyOnHead) {
				smoothYRef.current = nextHeadY;
			}

			lastScrollY = window.scrollY;
		};

		const onPointerMove = (e: PointerEvent) => {
			if (!draggingRef.current) return;
			e.preventDefault();
			dragTargetRef.current = progressFromPointer(e.clientY);
		};

		const endDrag = () => {
			if (!draggingRef.current) return;
			draggingRef.current = false;
			document.body.classList.remove('scroll-comet-dragging');
			syncProgressFromScroll();
			lastScrollY = window.scrollY;
		};

		const onPointerUp = (e: PointerEvent) => {
			if (!draggingRef.current) return;
			canvas.releasePointerCapture(e.pointerId);
			endDrag();
		};

		const render = (timestamp: number) => {
			const dt = Math.min(timestamp - lastFrameTime, 32);
			lastFrameTime = timestamp;

			if (draggingRef.current) {
				const prev = progressRef.current;
				progressRef.current = smoothStep(
					progressRef.current,
					dragTargetRef.current,
					24,
					dt,
				);
				scrollToProgress(progressRef.current);

				const delta = progressRef.current - prev;
				const speed = Math.abs(delta) / Math.max(dt / 1000, 0.001);
				velocityRef.current = smoothStep(
					velocityRef.current,
					Math.min(1.5, speed * 0.12),
					10,
					dt,
				);

				if (Math.abs(delta) > 0.0001) {
					scrollDirRef.current = delta > 0 ? 1 : -1;
				}
			} else {
				const prevScrollY = lastScrollY;
				syncProgressFromScroll();

				const scrollDelta = window.scrollY - prevScrollY;
				const instant = Math.min(
					1.5,
					Math.abs(scrollDelta) / Math.max(dt, 1),
				);
				velocityRef.current = smoothStep(
					velocityRef.current,
					instant,
					8,
					dt,
				);

				if (Math.abs(scrollDelta) > 0.1) {
					scrollDirRef.current = scrollDelta > 0 ? 1 : -1;
				}

				lastScrollY = window.scrollY;
			}

			const targetY = headYFromProgress(progressRef.current);
			const headEase = draggingRef.current ? 28 : 18;
			smoothYRef.current = smoothStep(
				smoothYRef.current,
				targetY,
				headEase,
				dt,
			);

			const headY = smoothYRef.current;
			const headX = width - HEAD_INSET;
			const endpointFade = Math.min(
				progressRef.current / 0.03,
				(1 - progressRef.current) / 0.03,
				1,
			);
			const brightness = Math.min(
				1.2,
				0.85 + velocityRef.current * 0.7,
			);

			ctx.clearRect(0, 0, width, height);

			drawScrollComet(
				ctx,
				headX,
				headY,
				width,
				height,
				progressRef.current,
				brightness,
				timestamp,
				scrollDirRef.current,
				velocityRef.current,
			);
			const atEndpoint =
				progressRef.current <= 0.012 || progressRef.current >= 0.988;
			if (atEndpoint || velocityRef.current < 0.06) {
				sparksRef.current.length = 0;
			}

			tickSparks(
				sparksRef.current,
				headX,
				headY,
				atEndpoint ? 0 : velocityRef.current * endpointFade,
				scrollDirRef.current,
			);
			drawSparks(ctx, sparksRef.current);

			updateScrollCometPointer({
				x: canvasLeft + headX,
				y: headY,
				visible: true,
			});

			if (!draggingRef.current) {
				velocityRef.current = smoothStep(velocityRef.current, 0, 6, dt);
			}

			lastProgressRef.current = progressRef.current;
			rafId = requestAnimationFrame(render);
		};

		resize();
		syncProgressFromScroll();
		smoothYRef.current = headYFromProgress(progressRef.current);
		lastScrollY = window.scrollY;

		window.addEventListener('resize', resize);
		canvas.addEventListener('pointerdown', onPointerDown);
		canvas.addEventListener('pointermove', onPointerMove);
		canvas.addEventListener('pointerup', onPointerUp);
		canvas.addEventListener('pointercancel', onPointerUp);
		rafId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(rafId);
			document.body.classList.remove('scroll-comet-dragging');
			updateScrollCometPointer({ x: -9999, y: -9999, visible: false });
			window.removeEventListener('resize', resize);
			canvas.removeEventListener('pointerdown', onPointerDown);
			canvas.removeEventListener('pointermove', onPointerMove);
			canvas.removeEventListener('pointerup', onPointerUp);
			canvas.removeEventListener('pointercancel', onPointerUp);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className='scroll-comet-canvas'
			aria-label='Page scroll'
			role='slider'
			aria-valuemin={0}
			aria-valuemax={100}
		/>
	);
};
