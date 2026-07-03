import { useEffect, useRef } from 'react';

type Point = { x: number; y: number };

const TRAIL_POINTS = 22;

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

const drawCometHead = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	time: number,
) => {
	const pulse = 0.92 + 0.08 * Math.sin(time * 0.0018);

	ctx.save();
	ctx.globalCompositeOperation = 'lighter';

	const halo = ctx.createRadialGradient(x, y, 0, x, y, 11);
	halo.addColorStop(0, `rgba(255, 255, 255, ${0.16 * pulse})`);
	halo.addColorStop(0.4, `rgba(140, 195, 255, ${0.07 * pulse})`);
	halo.addColorStop(1, 'rgba(31, 120, 220, 0)');
	ctx.fillStyle = halo;
	ctx.beginPath();
	ctx.arc(x, y, 11, 0, Math.PI * 2);
	ctx.fill();

	const bloom = ctx.createRadialGradient(x, y, 0, x, y, 6.5);
	bloom.addColorStop(0, 'rgba(255, 255, 255, 1)');
	bloom.addColorStop(0.32, `rgba(225, 242, 255, ${0.78 * pulse})`);
	bloom.addColorStop(0.6, `rgba(110, 185, 255, ${0.28 * pulse})`);
	bloom.addColorStop(1, 'rgba(31, 120, 220, 0)');
	ctx.fillStyle = bloom;
	ctx.beginPath();
	ctx.arc(x, y, 6.5, 0, Math.PI * 2);
	ctx.fill();

	const ray = 4.8 * pulse;
	ctx.strokeStyle = `rgba(215, 238, 255, ${0.22 * pulse})`;
	ctx.lineWidth = 0.55;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(x - ray, y);
	ctx.lineTo(x + ray, y);
	ctx.moveTo(x, y - ray);
	ctx.lineTo(x, y + ray);
	ctx.stroke();

	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.arc(x, y, 2, 0, Math.PI * 2);
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
		let prevPointerX = -100;
		let prevPointerY = -100;
		let speed = 0;

		const trail: Point[] = Array.from({ length: TRAIL_POINTS }, () => ({
			x: -100,
			y: -100,
		}));

		const resetTrail = (x: number, y: number) => {
			for (const point of trail) {
				point.x = x;
				point.y = y;
			}
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
		};

		const handleMouseEnter = (e: MouseEvent) => {
			active = true;
			resetTrail(e.clientX, e.clientY);
			pointerX = e.clientX;
			pointerY = e.clientY;
		};

		const updateTrail = () => {
			trail[0].x = pointerX;
			trail[0].y = pointerY;

			const moveSpeed = Math.hypot(
				pointerX - prevPointerX,
				pointerY - prevPointerY,
			);
			prevPointerX = pointerX;
			prevPointerY = pointerY;
			speed += (moveSpeed - speed) * 0.22;

			const speedBoost = Math.min(moveSpeed * 0.02, 0.08);

			for (let i = 1; i < trail.length; i++) {
				const ratio = i / (trail.length - 1);
				const follow = 0.4 - ratio * 0.28 + speedBoost;
				trail[i].x += (trail[i - 1].x - trail[i].x) * follow;
				trail[i].y += (trail[i - 1].y - trail[i].y) * follow;
			}
		};

		const render = (time: number) => {
			ctx.clearRect(0, 0, width, height);

			const hideTrail =
				overAiBot ||
				document.body.classList.contains('scroll-comet-dragging');

			if (active && !hideTrail) {
				updateTrail();
				drawFlowingTail(ctx, trail, speed);
				drawCometHead(ctx, pointerX, pointerY, time);
			} else {
				speed *= 0.75;
				if (speed < 0.02) speed = 0;
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
