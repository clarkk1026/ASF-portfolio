import { useEffect, useRef } from 'react';

type TrailPoint = { x: number; y: number };

const TRAIL_LENGTH = 14;
const STAR_SIZE = 8;
const HEAD_RADIUS = 7;

const drawStar = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	fill: string,
	glow: string,
) => {
	const spikes = 5;
	const outer = size;
	const inner = size * 0.44;

	ctx.save();
	ctx.shadowColor = glow;
	ctx.shadowBlur = 14;
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

	ctx.shadowColor = 'rgba(31, 120, 255, 0.9)';
	ctx.shadowBlur = 22;
	ctx.fillStyle = 'rgba(31, 100, 220, 0.28)';
	ctx.beginPath();
	ctx.arc(x, y, HEAD_RADIUS + 6, 0, Math.PI * 2);
	ctx.fill();

	ctx.shadowBlur = 16;
	ctx.fillStyle = 'rgba(100, 200, 255, 0.45)';
	ctx.beginPath();
	ctx.arc(x, y, HEAD_RADIUS + 2.5, 0, Math.PI * 2);
	ctx.fill();

	drawStar(ctx, x, y, STAR_SIZE, '#ffffff', 'rgba(125, 211, 252, 1)');

	ctx.shadowBlur = 10;
	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.arc(x, y, 2.8, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = 'rgba(180, 230, 255, 0.7)';
	ctx.beginPath();
	ctx.arc(x, y, 5, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
};

const drawCometTail = (ctx: CanvasRenderingContext2D, points: TrailPoint[]) => {
	if (points.length < 2) return;

	const head = points[0];
	const tail = points[points.length - 1];

	const outerGrad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
	outerGrad.addColorStop(0, 'rgba(20, 80, 200, 0)');
	outerGrad.addColorStop(0.3, 'rgba(31, 120, 220, 0.15)');
	outerGrad.addColorStop(0.62, 'rgba(31, 195, 255, 0.42)');
	outerGrad.addColorStop(0.88, 'rgba(200, 235, 255, 0.78)');
	outerGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

	const coreGrad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
	coreGrad.addColorStop(0, 'rgba(14, 165, 233, 0)');
	coreGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.35)');
	coreGrad.addColorStop(0.78, 'rgba(224, 242, 254, 0.9)');
	coreGrad.addColorStop(1, 'rgba(255, 255, 255, 1)');

	ctx.save();
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.shadowColor = 'rgba(31, 150, 255, 0.85)';
	ctx.shadowBlur = 16;

	ctx.strokeStyle = outerGrad;
	ctx.lineWidth = 7;
	ctx.globalAlpha = 0.55;
	ctx.beginPath();
	ctx.moveTo(tail.x, tail.y);
	for (let i = points.length - 1; i >= 0; i--) {
		ctx.lineTo(points[i].x, points[i].y);
	}
	ctx.stroke();

	ctx.globalAlpha = 1;
	ctx.shadowBlur = 10;
	ctx.strokeStyle = coreGrad;

	for (let i = points.length - 2; i >= 0; i--) {
		const t = 1 - i / (points.length - 1);
		ctx.lineWidth = 0.8 + t * 3.8;
		ctx.globalAlpha = 0.3 + t * 0.7;
		ctx.beginPath();
		ctx.moveTo(points[i + 1].x, points[i + 1].y);
		ctx.lineTo(points[i].x, points[i].y);
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
		let visible = false;
		let targetX = 0;
		let targetY = 0;
		const trail: TrailPoint[] = Array.from({ length: TRAIL_LENGTH }, () => ({
			x: 0,
			y: 0,
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

		const handleMouseMove = (e: MouseEvent) => {
			const overAiBot = (e.target as Element | null)?.closest(
				'.ai-bot-interactive',
			);
			visible = !overAiBot;
			targetX = e.clientX;
			targetY = e.clientY;
		};

		const render = () => {
			ctx.clearRect(0, 0, width, height);

			if (visible) {
				for (let i = trail.length - 1; i > 0; i--) {
					const follow = 0.32 + (i / trail.length) * 0.26;
					trail[i].x += (trail[i - 1].x - trail[i].x) * follow;
					trail[i].y += (trail[i - 1].y - trail[i].y) * follow;
				}

				trail[0].x += (targetX - trail[0].x) * 0.62;
				trail[0].y += (targetY - trail[0].y) * 0.62;

				drawCometTail(ctx, trail);
				drawCometHead(ctx, trail[0].x, trail[0].y);
			}

			rafId = requestAnimationFrame(render);
		};

		resize();
		window.addEventListener('resize', resize);
		window.addEventListener('mousemove', handleMouseMove);
		rafId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
			window.removeEventListener('mousemove', handleMouseMove);
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
