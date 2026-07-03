import { useEffect, useRef } from 'react';

type TrailPoint = { x: number; y: number };

type Sparkle = {
	x: number;
	y: number;
	life: number;
	maxLife: number;
	angle: number;
	size: number;
};

const TRAIL_LENGTH = 24;
const MAX_SPARKLES = 12;

const drawDiffractionRays = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	length: number,
	alpha: number,
	rotation: number,
) => {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(rotation);
	ctx.globalCompositeOperation = 'lighter';
	ctx.lineCap = 'round';

	const drawRay = (angle: number, len: number, width: number, a: number) => {
		ctx.strokeStyle = `rgba(220, 240, 255, ${a * alpha})`;
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(Math.cos(angle) * -len, Math.sin(angle) * -len);
		ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
		ctx.stroke();
	};

	drawRay(0, length, 0.7, 0.55);
	drawRay(Math.PI / 2, length, 0.7, 0.55);
	drawRay(Math.PI / 4, length * 0.55, 0.35, 0.22);
	drawRay((Math.PI * 3) / 4, length * 0.55, 0.35, 0.22);

	ctx.restore();
};

const drawStarShape = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	fill: string,
	rotation: number,
) => {
	const spikes = 5;
	const outer = size;
	const inner = size * 0.42;

	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(rotation);
	ctx.fillStyle = fill;
	ctx.beginPath();

	for (let i = 0; i < spikes * 2; i++) {
		const radius = i % 2 === 0 ? outer : inner;
		const angle = Math.PI / 2 + (i * Math.PI) / spikes;
		const px = Math.cos(angle) * radius;
		const py = Math.sin(angle) * radius;
		if (i === 0) ctx.moveTo(px, py);
		else ctx.lineTo(px, py);
	}

	ctx.closePath();
	ctx.fill();
	ctx.restore();
};

const drawStarHead = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	time: number,
	velocity: number,
) => {
	const twinkle =
		0.72 +
		0.28 * Math.sin(time * 0.0038) +
		0.1 * Math.sin(time * 0.0085 + 1.7);
	const speedBoost = Math.min(velocity * 0.012, 0.35);
	const brightness = Math.min(twinkle + speedBoost, 1.15);
	const rotation = time * 0.00035;

	ctx.save();
	ctx.globalCompositeOperation = 'lighter';

	const outerBloom = ctx.createRadialGradient(x, y, 0, x, y, 28);
	outerBloom.addColorStop(0, `rgba(255, 255, 255, ${0.18 * brightness})`);
	outerBloom.addColorStop(0.25, `rgba(180, 220, 255, ${0.12 * brightness})`);
	outerBloom.addColorStop(0.55, `rgba(80, 160, 255, ${0.06 * brightness})`);
	outerBloom.addColorStop(1, 'rgba(31, 120, 220, 0)');
	ctx.fillStyle = outerBloom;
	ctx.beginPath();
	ctx.arc(x, y, 28, 0, Math.PI * 2);
	ctx.fill();

	const innerGlow = ctx.createRadialGradient(x, y, 0, x, y, 12);
	innerGlow.addColorStop(0, `rgba(255, 255, 255, ${0.95 * brightness})`);
	innerGlow.addColorStop(0.35, `rgba(200, 230, 255, ${0.55 * brightness})`);
	innerGlow.addColorStop(0.7, `rgba(100, 180, 255, ${0.2 * brightness})`);
	innerGlow.addColorStop(1, 'rgba(31, 120, 220, 0)');
	ctx.fillStyle = innerGlow;
	ctx.beginPath();
	ctx.arc(x, y, 12, 0, Math.PI * 2);
	ctx.fill();

	drawDiffractionRays(ctx, x, y, 10 + velocity * 0.15, brightness, rotation);

	drawStarShape(
		ctx,
		x,
		y,
		5.5 + speedBoost * 2,
		`rgba(255, 255, 255, ${0.92 * brightness})`,
		rotation,
	);

	ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
	ctx.beginPath();
	ctx.arc(x, y, 2.2, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * brightness})`;
	ctx.beginPath();
	ctx.arc(x, y, 0.9, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
};

const drawCometTail = (
	ctx: CanvasRenderingContext2D,
	points: TrailPoint[],
	velocity: number,
	time: number,
) => {
	if (points.length < 2) return;

	const head = points[0];
	const tail = points[points.length - 1];
	const segments = points.length - 1;
	const stretch = 1 + Math.min(velocity * 0.02, 0.5);

	ctx.save();
	ctx.lineCap = 'round';
	ctx.globalCompositeOperation = 'lighter';

	const wakeGrad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
	wakeGrad.addColorStop(0, 'rgba(20, 70, 160, 0)');
	wakeGrad.addColorStop(0.4, `rgba(60, 140, 255, ${0.08 * stretch})`);
	wakeGrad.addColorStop(0.75, `rgba(31, 195, 255, ${0.22 * stretch})`);
	wakeGrad.addColorStop(1, `rgba(230, 245, 255, ${0.38 * stretch})`);

	ctx.strokeStyle = wakeGrad;
	ctx.lineWidth = 5 + velocity * 0.08;
	ctx.globalAlpha = 0.6;
	ctx.beginPath();
	ctx.moveTo(tail.x, tail.y);
	for (let i = points.length - 1; i >= 0; i--) {
		ctx.lineTo(points[i].x, points[i].y);
	}
	ctx.stroke();

	for (let i = 0; i < segments; i++) {
		const t0 = i / segments;
		const t1 = (i + 1) / segments;
		const fade0 = Math.pow(t0, 2.4);
		const fade1 = Math.pow(t1, 2.4);
		const p0 = points[points.length - 1 - i];
		const p1 = points[points.length - 2 - i];
		const shimmer = 0.85 + 0.15 * Math.sin(time * 0.006 + i * 0.8);

		const segGrad = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
		segGrad.addColorStop(0, `rgba(120, 190, 255, ${fade0 * 0.4 * shimmer})`);
		segGrad.addColorStop(1, `rgba(240, 250, 255, ${fade1 * 0.78 * shimmer})`);

		ctx.strokeStyle = segGrad;
		ctx.lineWidth = 0.35 + fade1 * 2.4;
		ctx.globalAlpha = 0.88;
		ctx.beginPath();
		ctx.moveTo(p0.x, p0.y);
		ctx.lineTo(p1.x, p1.y);
		ctx.stroke();
	}

	for (let i = 2; i < points.length; i += 3) {
		const t = i / points.length;
		const fade = Math.pow(1 - t, 2.5);
		if (fade < 0.15) continue;

		const p = points[i];
		const sparkleAlpha =
			fade * (0.35 + 0.25 * Math.sin(time * 0.005 + i * 1.1));
		const size = 0.6 + fade * 1.2;

		ctx.fillStyle = `rgba(200, 230, 255, ${sparkleAlpha})`;
		ctx.beginPath();
		ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
		ctx.fill();
	}

	ctx.restore();
};

const drawSparkles = (ctx: CanvasRenderingContext2D, sparkles: Sparkle[]) => {
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';

	for (const s of sparkles) {
		const life = s.life / s.maxLife;
		const alpha = life * (1 - life) * 4;
		if (alpha <= 0) continue;

		const len = s.size * (1 + (1 - life) * 2);

		ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(s.x - len, s.y);
		ctx.lineTo(s.x + len, s.y);
		ctx.moveTo(s.x, s.y - len);
		ctx.lineTo(s.x, s.y + len);
		ctx.stroke();

		ctx.fillStyle = `rgba(220, 240, 255, ${alpha})`;
		ctx.beginPath();
		ctx.arc(s.x, s.y, s.size * 0.4, 0, Math.PI * 2);
		ctx.fill();
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
		let prevX = -100;
		let prevY = -100;
		let smoothVel = 0;
		let sparkles: Sparkle[] = [];
		let sparkleTimer = 0;

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

		const spawnSparkle = (x: number, y: number, velocity: number) => {
			if (sparkles.length >= MAX_SPARKLES) sparkles.shift();
			const spread = 4 + velocity * 0.3;
			sparkles.push({
				x: x + (Math.random() - 0.5) * spread,
				y: y + (Math.random() - 0.5) * spread,
				life: 1,
				maxLife: 18 + Math.random() * 14,
				angle: Math.random() * Math.PI * 2,
				size: 1 + Math.random() * 1.5,
			});
		};

		const syncPointer = (e: MouseEvent | PointerEvent) => {
			active = true;
			const target = e.target as Element | null;
			overAiBot = Boolean(
				target?.closest('.ai-bot-interactive') ||
					target?.closest('.visitor-note-interactive'),
			);

			const rawVel = Math.hypot(e.clientX - prevX, e.clientY - prevY);
			smoothVel += (rawVel - smoothVel) * 0.22;

			prevX = targetX;
			prevY = targetY;
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

		const render = (time: number) => {
			ctx.clearRect(0, 0, width, height);

			const hideTrail =
				overAiBot ||
				document.body.classList.contains('scroll-comet-dragging');

			sparkles = sparkles
				.map((s) => ({ ...s, life: s.life + 1 }))
				.filter((s) => s.life < s.maxLife);

			if (active && !hideTrail) {
				trail[0].x = targetX;
				trail[0].y = targetY;

				const speedFactor = Math.min(smoothVel / 14, 1);

				for (let i = 1; i < trail.length; i++) {
					const follow = 0.18 + speedFactor * 0.2 + (i / trail.length) * 0.1;
					trail[i].x += (trail[i - 1].x - trail[i].x) * follow;
					trail[i].y += (trail[i - 1].y - trail[i].y) * follow;
				}

				sparkleTimer += smoothVel;
				if (sparkleTimer > 6) {
					spawnSparkle(targetX, targetY, smoothVel);
					sparkleTimer = 0;
				}

				drawCometTail(ctx, trail, smoothVel, time);
				drawSparkles(ctx, sparkles);
				drawStarHead(ctx, targetX, targetY, time, smoothVel);
			}

			rafId = requestAnimationFrame(render);
		};

		resize();
		window.addEventListener('resize', resize);
		document.addEventListener('mousemove', handleMouseMove, { passive: true });
		document.addEventListener('pointermove', syncPointer, { passive: true });
		document.addEventListener('pointerdown', syncPointer, { passive: true });
		document.addEventListener('mouseleave', handleMouseLeave);
		document.addEventListener('mouseenter', handleMouseEnter);
		rafId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
			document.removeEventListener('mousemove', handleMouseMove);
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
