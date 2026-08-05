import { useEffect, useRef } from 'react';
import {
	decayCometImpactPulse,
	getCometImpactPulse,
	updateCometPointer,
} from '../lib/comet-pointer';
import { drawMeteorBursts, updateMeteorBursts } from '../lib/meteor-fx';

type Point = { x: number; y: number };

const TRAIL_POINTS = 10;
const TEAM_TRAIL_POINTS = 22;
const MAX_SAMPLES = 8;

const buildSmoothPath = (
	ctx: CanvasRenderingContext2D,
	points: Point[],
) => {
	const n = points.length;
	if (n < 2) return;

	ctx.moveTo(points[n - 1].x, points[n - 1].y);

	for (let i = n - 2; i > 0; i--) {
		const cx = (points[i].x + points[i - 1].x) * 0.5;
		const cy = (points[i].y + points[i - 1].y) * 0.5;
		ctx.quadraticCurveTo(points[i].x, points[i].y, cx, cy);
	}

	ctx.lineTo(points[0].x, points[0].y);
};

const drawFlowingTail = (
	ctx: CanvasRenderingContext2D,
	trail: Point[],
	speed: number,
) => {
	if (trail.length < 2 || speed < 0.15) return;

	const head = trail[0];
	const tail = trail[trail.length - 1];
	const motion = Math.min(speed / 18, 1);

	ctx.save();
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.globalCompositeOperation = 'lighter';

	const wakeGrad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
	wakeGrad.addColorStop(0, 'rgba(25, 70, 140, 0)');
	wakeGrad.addColorStop(0.35, `rgba(50, 110, 200, ${0.04 + motion * 0.05})`);
	wakeGrad.addColorStop(0.7, `rgba(90, 170, 255, ${0.1 + motion * 0.12})`);
	wakeGrad.addColorStop(1, `rgba(215, 238, 255, ${0.2 + motion * 0.18})`);

	ctx.strokeStyle = wakeGrad;
	ctx.lineWidth = 3.5 + motion * 4;
	ctx.beginPath();
	buildSmoothPath(ctx, trail);
	ctx.stroke();

	const coreGrad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
	coreGrad.addColorStop(0, 'rgba(120, 175, 255, 0)');
	coreGrad.addColorStop(0.45, `rgba(160, 205, 255, ${0.12 + motion * 0.18})`);
	coreGrad.addColorStop(0.82, `rgba(230, 245, 255, ${0.45 + motion * 0.35})`);
	coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0.92)');

	ctx.strokeStyle = coreGrad;
	ctx.lineWidth = 0.8 + motion * 1.6;
	ctx.beginPath();
	buildSmoothPath(ctx, trail);
	ctx.stroke();

	const hotLen = Math.min(6, trail.length - 1);
	if (hotLen > 1) {
		const hotSlice = trail.slice(0, hotLen + 1);
		const hotStart = hotSlice[hotSlice.length - 1];
		const hotGrad = ctx.createLinearGradient(hotStart.x, hotStart.y, head.x, head.y);
		hotGrad.addColorStop(0, `rgba(190, 225, 255, ${0.35 + motion * 0.2})`);
		hotGrad.addColorStop(0.55, 'rgba(245, 250, 255, 0.9)');
		hotGrad.addColorStop(1, 'rgba(255, 255, 255, 1)');

		ctx.strokeStyle = hotGrad;
		ctx.lineWidth = 1.3 + motion * 0.7;
		ctx.beginPath();
		buildSmoothPath(ctx, hotSlice);
		ctx.stroke();
	}

	ctx.restore();
};

const drawTeamCometTail = (
	ctx: CanvasRenderingContext2D,
	trail: Point[],
	speed: number,
) => {
	if (trail.length < 2 || speed < 0.15) return;

	const motion = Math.min(speed / 18, 1);

	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	for (let i = trail.length - 2; i >= 0; i--) {
		const strength = 1 - i / (trail.length - 1);
		const from = trail[i + 1];
		const to = trail[i];

		ctx.strokeStyle = `rgba(30, 105, 225, ${0.025 + strength * (0.12 + motion * 0.08)})`;
		ctx.lineWidth = 0.3 + strength * (7 + motion * 4);
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();

		ctx.strokeStyle = `rgba(75, 170, 255, ${0.08 + strength * (0.3 + motion * 0.22)})`;
		ctx.lineWidth = 0.2 + strength * (2.6 + motion * 1.8);
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
	}

	const head = trail[0];
	const tail = trail[trail.length - 1];
	const core = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
	core.addColorStop(0, 'rgba(100, 185, 255, 0)');
	core.addColorStop(0.55, 'rgba(145, 210, 255, 0.25)');
	core.addColorStop(0.86, 'rgba(225, 244, 255, 0.8)');
	core.addColorStop(1, 'rgba(255, 255, 255, 1)');
	ctx.strokeStyle = core;
	ctx.lineWidth = 0.75 + motion * 1.1;
	ctx.beginPath();
	buildSmoothPath(ctx, trail);
	ctx.stroke();

	ctx.restore();
};

type MouseTrailProps = {
	team?: boolean;
};

export const MouseTrail = ({ team = false }: MouseTrailProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const cursorRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const cursor = cursorRef.current;
		if (!canvas || !cursor) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let width = window.innerWidth;
		let height = window.innerHeight;
		let rafId = 0;
		let active = false;
		let overAiBot = false;

		let pointerX = -100;
		let pointerY = -100;
		let prevPointerX = -100;
		let prevPointerY = -100;
		let speed = 0;
		let lastFrameTime = performance.now();
		let cursorVisible = false;
		let lastImpact = -1;

		const samples: Point[] = [];

		const trailPointCount = team ? TEAM_TRAIL_POINTS : TRAIL_POINTS;
		const trail: Point[] = Array.from({ length: trailPointCount }, () => ({
			x: -100,
			y: -100,
		}));

		const resetTrail = (x: number, y: number) => {
			for (const point of trail) {
				point.x = x;
				point.y = y;
			}
			samples.length = 0;
			prevPointerX = x;
			prevPointerY = y;
		};

		const resize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const syncPointer = (e: MouseEvent | PointerEvent) => {
			if (!active) {
				resetTrail(e.clientX, e.clientY);
				pointerX = e.clientX;
				pointerY = e.clientY;
			}
			active = true;
			const target = e.target as Element | null;
			overAiBot = Boolean(
				target?.closest('.ai-bot-interactive') ||
					target?.closest('.visitor-note-interactive'),
			);

			const coalesced =
				'getCoalescedEvents' in e ? e.getCoalescedEvents() : [];

			if (coalesced.length > 1) {
				for (const point of coalesced) {
					samples.push({ x: point.clientX, y: point.clientY });
				}
			} else {
				samples.push({ x: e.clientX, y: e.clientY });
			}

			if (samples.length > MAX_SAMPLES) {
				samples.splice(0, samples.length - MAX_SAMPLES);
			}

			pointerX = e.clientX;
			pointerY = e.clientY;
			cursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
		};

		const handleMouseLeave = () => {
			active = false;
			cursor.style.opacity = '0';
		};

		const handleMouseEnter = (e: MouseEvent) => {
			active = true;
			resetTrail(e.clientX, e.clientY);
			pointerX = e.clientX;
			pointerY = e.clientY;
			cursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
			cursor.style.opacity = '1';
		};

		const advanceTrail = (step: number, speedBoost: number) => {
			for (let i = 1; i < trail.length; i++) {
				const ratio = i / (trail.length - 1);
				const base = Math.min(0.82 - ratio * 0.3 + speedBoost, 0.96);
				const follow = 1 - Math.pow(1 - base, step);
				trail[i].x += (trail[i - 1].x - trail[i].x) * follow;
				trail[i].y += (trail[i - 1].y - trail[i].y) * follow;
			}
		};

		const updateTrail = (
			frameStep: number,
			headX: number,
			headY: number,
		) => {
			const speedBoost = Math.min(speed * 0.012, 0.09);

			if (samples.length === 0) {
				trail[0].x = pointerX;
				trail[0].y = pointerY;
				advanceTrail(frameStep, speedBoost);
			} else {
				const stepSize = frameStep / samples.length;
				for (const sample of samples) {
					trail[0].x = sample.x;
					trail[0].y = sample.y;
					advanceTrail(stepSize, speedBoost);
				}
				samples.length = 0;
			}

			trail[0].x = headX;
			trail[0].y = headY;
		};

		const render = (time: number) => {
			const frameStep = Math.min(
				Math.max((time - lastFrameTime) / 16.67, 0.2),
				3,
			);
			lastFrameTime = time;

			ctx.clearRect(0, 0, width, height);

			const hideTrail =
				overAiBot ||
				document.body.classList.contains('scroll-comet-dragging');

			const deltaX = pointerX - prevPointerX;
			const deltaY = pointerY - prevPointerY;
			prevPointerX = pointerX;
			prevPointerY = pointerY;

			const smoothing = 1 - Math.pow(0.25, frameStep);
			speed += (Math.hypot(deltaX, deltaY) / frameStep - speed) * smoothing;

			const visible = active && !hideTrail;
			if (visible !== cursorVisible) {
				cursorVisible = visible;
				cursor.style.opacity = visible ? '1' : '0';
			}

			const impact = getCometImpactPulse();
			if (impact !== lastImpact) {
				lastImpact = impact;
				cursor.style.setProperty('--comet-impact', impact.toFixed(3));
			}

			updateCometPointer({
				x: pointerX,
				y: pointerY,
				active,
				hidden: hideTrail,
			});

			updateMeteorBursts(frameStep);
			decayCometImpactPulse(0.06 * frameStep);

			if (active && !hideTrail) {
				updateTrail(frameStep, pointerX, pointerY);
				if (team) {
					drawTeamCometTail(ctx, trail, speed);
				} else {
					drawFlowingTail(ctx, trail, speed);
				}
				drawMeteorBursts(ctx);
			} else {
				samples.length = 0;
				drawMeteorBursts(ctx);
				speed *= Math.pow(0.75, frameStep);
				if (speed < 0.02) speed = 0;
			}

			rafId = requestAnimationFrame(render);
		};

		const moveEvent =
			typeof window.PointerEvent === 'function' ? 'pointermove' : 'mousemove';

		resize();
		window.addEventListener('resize', resize);
		document.addEventListener(moveEvent, syncPointer, { passive: true });
		document.addEventListener('pointerdown', syncPointer, { passive: true });
		document.addEventListener('mouseleave', handleMouseLeave);
		document.addEventListener('mouseenter', handleMouseEnter);
		rafId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
			document.removeEventListener(moveEvent, syncPointer);
			document.removeEventListener('pointerdown', syncPointer);
			document.removeEventListener('mouseleave', handleMouseLeave);
			document.removeEventListener('mouseenter', handleMouseEnter);
		};
	}, [team]);

	return (
		<>
			<canvas
				ref={canvasRef}
				className='mouse-comet-canvas'
				aria-hidden='true'
			/>
			<span
				ref={cursorRef}
				className='mouse-comet-head'
				aria-hidden='true'
			/>
		</>
	);
};
