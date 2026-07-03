import { useEffect, useRef } from 'react';

type Point = { x: number; y: number };

const HISTORY_MAX = 16;
const SAMPLE_DIST = 3;

const tailColor = (alpha: number) => `rgba(210, 228, 255, ${alpha})`;

const drawNaturalTail = (
	ctx: CanvasRenderingContext2D,
	history: Point[],
	speed: number,
) => {
	if (history.length < 2 || speed < 0.4) return;

	const head = history[0];
	const tail = history[history.length - 1];
	const segments = history.length - 1;

	ctx.save();
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.globalCompositeOperation = 'lighter';

	const wakeGrad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
	wakeGrad.addColorStop(0, 'rgba(30, 80, 160, 0)');
	wakeGrad.addColorStop(0.45, `rgba(50, 120, 200, ${Math.min(speed * 0.004, 0.06)})`);
	wakeGrad.addColorStop(0.78, `rgba(100, 180, 255, ${Math.min(speed * 0.008, 0.14)})`);
	wakeGrad.addColorStop(1, `rgba(210, 235, 255, ${Math.min(speed * 0.012, 0.22)})`);

	ctx.strokeStyle = wakeGrad;
	ctx.lineWidth = 2.2 + Math.min(speed * 0.04, 2.5);
	ctx.beginPath();
	ctx.moveTo(tail.x, tail.y);
	for (let i = history.length - 2; i >= 0; i--) {
		ctx.lineTo(history[i].x, history[i].y);
	}
	ctx.stroke();

	for (let i = 0; i < segments; i++) {
		const t0 = i / segments;
		const t1 = (i + 1) / segments;
		const fade0 = Math.pow(t0, 2.8);
		const fade1 = Math.pow(t1, 2.8);
		const p0 = history[history.length - 1 - i];
		const p1 = history[history.length - 2 - i];

		const segGrad = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
		segGrad.addColorStop(0, tailColor(fade0 * 0.28));
		segGrad.addColorStop(1, tailColor(fade1 * 0.62));

		ctx.strokeStyle = segGrad;
		ctx.lineWidth = 0.25 + fade1 * 1.4;
		ctx.beginPath();
		ctx.moveTo(p0.x, p0.y);
		ctx.lineTo(p1.x, p1.y);
		ctx.stroke();
	}

	const hotEnd = Math.min(3, segments);
	if (hotEnd > 0) {
		const hotStart = history[hotEnd];
		const hotGrad = ctx.createLinearGradient(hotStart.x, hotStart.y, head.x, head.y);
		hotGrad.addColorStop(0, 'rgba(180, 220, 255, 0.35)');
		hotGrad.addColorStop(0.65, 'rgba(235, 248, 255, 0.8)');
		hotGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

		ctx.strokeStyle = hotGrad;
		ctx.lineWidth = 0.9 + Math.min(speed * 0.015, 0.6);
		ctx.beginPath();
		ctx.moveTo(hotStart.x, hotStart.y);
		for (let i = hotEnd - 1; i >= 0; i--) {
			ctx.lineTo(history[i].x, history[i].y);
		}
		ctx.stroke();
	}

	ctx.restore();
};

const drawNaturalHead = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	speed: number,
	time: number,
) => {
	const twinkle = 0.88 + 0.12 * Math.sin(time * 0.0022 + 0.5);

	ctx.save();
	ctx.globalCompositeOperation = 'lighter';

	const glowRadius = 4.5 + Math.min(speed * 0.03, 1.2);
	const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
	glow.addColorStop(0, `rgba(255, 255, 255, ${0.9 * twinkle})`);
	glow.addColorStop(0.3, `rgba(220, 240, 255, ${0.45 * twinkle})`);
	glow.addColorStop(0.65, `rgba(100, 175, 255, ${0.12 * twinkle})`);
	glow.addColorStop(1, 'rgba(31, 120, 220, 0)');
	ctx.fillStyle = glow;
	ctx.beginPath();
	ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
	ctx.fill();

	if (speed < 6) {
		const spike = 3.2 * twinkle;
		ctx.strokeStyle = `rgba(210, 235, 255, ${0.18 * twinkle})`;
		ctx.lineWidth = 0.45;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(x - spike, y);
		ctx.lineTo(x + spike, y);
		ctx.moveTo(x, y - spike);
		ctx.lineTo(x, y + spike);
		ctx.stroke();
	}

	ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
	ctx.beginPath();
	ctx.arc(x, y, 1.15, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
};

export const MouseTrail = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let width = window.innerWidth;
		let height = window.innerHeight;
		let rafId = 0;
		let active = false;
		let overAiBot = false;

		let pointerX = -100;
		let pointerY = -100;
		let renderX = -100;
		let renderY = -100;
		let speed = 0;
		let lastSampleX = -100;
		let lastSampleY = -100;

		const history: Point[] = [];

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

		const pushHistory = (x: number, y: number) => {
			const dist = Math.hypot(x - lastSampleX, y - lastSampleY);
			if (dist < SAMPLE_DIST && history.length > 0) return;

			history.unshift({ x, y });
			if (history.length > HISTORY_MAX) history.pop();

			lastSampleX = x;
			lastSampleY = y;
		};

		const syncPointer = (e: MouseEvent | PointerEvent) => {
			active = true;
			const target = e.target as Element | null;
			overAiBot = Boolean(
				target?.closest('.ai-bot-interactive') ||
					target?.closest('.visitor-note-interactive'),
			);
			pointerX = e.clientX;
			pointerY = e.clientY;
		};

		const handleMouseLeave = () => {
			active = false;
			history.length = 0;
		};

		const handleMouseEnter = () => {
			active = true;
		};

		const render = (time: number) => {
			ctx.clearRect(0, 0, width, height);

			const hideTrail =
				overAiBot ||
				document.body.classList.contains('scroll-comet-dragging');

			if (active && !hideTrail) {
				const dx = pointerX - renderX;
				const dy = pointerY - renderY;
				const instantSpeed = Math.hypot(dx, dy);
				speed += (instantSpeed - speed) * 0.28;

				const follow = 0.42 + Math.min(speed / 28, 0.48);
				renderX += dx * follow;
				renderY += dy * follow;

				pushHistory(renderX, renderY);

				drawNaturalTail(ctx, history, speed);
				drawNaturalHead(ctx, renderX, renderY, speed, time);
			} else {
				speed *= 0.82;
				if (speed < 0.05) speed = 0;
			}

			rafId = requestAnimationFrame(render);
		};

		resize();
		window.addEventListener('resize', resize);
		document.addEventListener('mousemove', syncPointer, { passive: true });
		document.addEventListener('pointermove', syncPointer, { passive: true });
		document.addEventListener('pointerdown', syncPointer, { passive: true });
		document.addEventListener('mouseleave', handleMouseLeave);
		document.addEventListener('mouseenter', handleMouseEnter);
		rafId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
			document.removeEventListener('mousemove', syncPointer);
			document.removeEventListener('pointermove', syncPointer);
			document.removeEventListener('pointerdown', syncPointer);
			document.removeEventListener('mouseleave', handleMouseLeave);
			document.removeEventListener('mouseenter', handleMouseEnter);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className='mouse-comet-canvas'
			aria-hidden='true'
		/>
	);
};
