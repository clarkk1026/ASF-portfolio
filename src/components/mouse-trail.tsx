import { useEffect, useRef } from 'react';
import { isNearScrollCometPointer } from '../lib/scroll-comet-pointer';

type TrailPoint = { x: number; y: number };

const TRAIL_LENGTH = 20;

const drawStar = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	fill: string,
) => {
	const spikes = 5;
	const outer = size;
	const inner = size * 0.44;

	ctx.save();
	ctx.fillStyle = fill;
	ctx.beginPath();

	for (let i = 0; i < spikes * 2; i++) {
		const radius = i % 2 === 0 ? outer : inner;
		const angle = Math.PI / 2 + (i * Math.PI) / spikes;
		const px = x + Math.cos(angle) * radius;
		const py = y + Math.sin(angle) * radius;
		if (i === 0) ctx.moveTo(px, py);
		else ctx.lineTo(px, py);
	}

	ctx.closePath();
	ctx.fill();
	ctx.restore();
};

const drawCometHead = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
	ctx.save();

	const glow = ctx.createRadialGradient(x, y, 0, x, y, 14);
	glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
	glow.addColorStop(0.4, 'rgba(100, 190, 255, 0.45)');
	glow.addColorStop(1, 'rgba(31, 120, 220, 0)');
	ctx.fillStyle = glow;
	ctx.beginPath();
	ctx.arc(x, y, 14, 0, Math.PI * 2);
	ctx.fill();

	drawStar(ctx, x, y, 6.5, '#ffffff');

	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.arc(x, y, 2.5, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
};

const drawCometTail = (ctx: CanvasRenderingContext2D, points: TrailPoint[]) => {
	if (points.length < 2) return;

	const head = points[0];
	const tail = points[points.length - 1];
	const segments = points.length - 1;

	ctx.save();
	ctx.lineCap = 'round';
	ctx.globalCompositeOperation = 'lighter';

	// Soft outer wake
	const wakeGrad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
	wakeGrad.addColorStop(0, 'rgba(20, 70, 160, 0)');
	wakeGrad.addColorStop(0.5, 'rgba(31, 120, 220, 0.12)');
	wakeGrad.addColorStop(0.85, 'rgba(31, 195, 255, 0.28)');
	wakeGrad.addColorStop(1, 'rgba(200, 235, 255, 0.4)');

	ctx.strokeStyle = wakeGrad;
	ctx.lineWidth = 6;
	ctx.globalAlpha = 0.55;
	ctx.beginPath();
	ctx.moveTo(tail.x, tail.y);
	for (let i = points.length - 1; i >= 0; i--) {
		ctx.lineTo(points[i].x, points[i].y);
	}
	ctx.stroke();

	// Tapered core segments with exponential fade toward tail
	for (let i = 0; i < segments; i++) {
		const t0 = i / segments;
		const t1 = (i + 1) / segments;
		const fade0 = Math.pow(t0, 2.6);
		const fade1 = Math.pow(t1, 2.6);
		const p0 = points[points.length - 1 - i];
		const p1 = points[points.length - 2 - i];

		const segGrad = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
		segGrad.addColorStop(0, `rgba(120, 190, 255, ${fade0 * 0.45})`);
		segGrad.addColorStop(1, `rgba(220, 245, 255, ${fade1 * 0.75})`);

		ctx.strokeStyle = segGrad;
		ctx.lineWidth = 0.4 + fade1 * 2.2;
		ctx.globalAlpha = 0.85;
		ctx.beginPath();
		ctx.moveTo(p0.x, p0.y);
		ctx.lineTo(p1.x, p1.y);
		ctx.stroke();
	}

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
		let targetX = -100;
		let targetY = -100;
		const trail: TrailPoint[] = Array.from({ length: TRAIL_LENGTH }, () => ({
			x: -100,
			y: -100,
		}));

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
			active = true;
			const target = e.target as Element | null;
			overAiBot = Boolean(
				target?.closest('.ai-bot-interactive') ||
					target?.closest('.visitor-note-interactive'),
			);
			targetX = e.clientX;
			targetY = e.clientY;
		};

		const handleMouseMove = (e: MouseEvent) => {
			syncPointer(e);
		};

		const handleMouseLeave = () => {
			active = false;
		};

		const handleMouseEnter = () => {
			active = true;
		};

		const render = () => {
			ctx.clearRect(0, 0, width, height);

			const hideTrail =
				overAiBot ||
				document.body.classList.contains('scroll-comet-dragging') ||
				isNearScrollCometPointer(targetX, targetY);

			if (active && !hideTrail) {
				trail[0].x = targetX;
				trail[0].y = targetY;

				for (let i = 1; i < trail.length; i++) {
					const follow = 0.28 + (i / trail.length) * 0.14;
					trail[i].x += (trail[i - 1].x - trail[i].x) * follow;
					trail[i].y += (trail[i - 1].y - trail[i].y) * follow;
				}

				drawCometTail(ctx, trail);
				drawCometHead(ctx, targetX, targetY);
			}

			rafId = requestAnimationFrame(render);
		};

		resize();
		window.addEventListener('resize', resize);
		document.addEventListener('mousemove', handleMouseMove, { passive: true });
		document.addEventListener('pointerdown', syncPointer, { passive: true });
		document.addEventListener('mouseleave', handleMouseLeave);
		document.addEventListener('mouseenter', handleMouseEnter);
		rafId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
			document.removeEventListener('mousemove', handleMouseMove);
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
