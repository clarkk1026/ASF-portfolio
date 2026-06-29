import { useEffect, useRef } from 'react';

type TrailPoint = { x: number; y: number };

const TRAIL_LENGTH = 16;

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

	const outerGrad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
	outerGrad.addColorStop(0, 'rgba(20, 80, 200, 0)');
	outerGrad.addColorStop(0.4, 'rgba(31, 120, 220, 0.2)');
	outerGrad.addColorStop(0.75, 'rgba(31, 195, 255, 0.5)');
	outerGrad.addColorStop(1, 'rgba(220, 245, 255, 0.88)');

	ctx.save();
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.globalCompositeOperation = 'lighter';

	ctx.strokeStyle = outerGrad;
	ctx.lineWidth = 5;
	ctx.globalAlpha = 0.65;
	ctx.beginPath();
	ctx.moveTo(tail.x, tail.y);
	for (let i = points.length - 1; i >= 0; i--) {
		ctx.lineTo(points[i].x, points[i].y);
	}
	ctx.stroke();

	ctx.strokeStyle = 'rgba(240, 250, 255, 0.85)';
	for (let i = points.length - 2; i >= 0; i--) {
		const t = 1 - i / (points.length - 1);
		ctx.lineWidth = 0.5 + t * 2;
		ctx.globalAlpha = 0.2 + t * 0.7;
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

		const handleMouseMove = (e: MouseEvent) => {
			active = true;
			overAiBot = Boolean(
				(e.target as Element | null)?.closest('.ai-bot-interactive'),
			);
			targetX = e.clientX;
			targetY = e.clientY;
		};

		const handleMouseLeave = () => {
			active = false;
		};

		const handleMouseEnter = () => {
			active = true;
		};

		const render = () => {
			ctx.clearRect(0, 0, width, height);

			if (active && !overAiBot) {
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
		document.addEventListener('mouseleave', handleMouseLeave);
		document.addEventListener('mouseenter', handleMouseEnter);
		rafId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
			document.removeEventListener('mousemove', handleMouseMove);
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
