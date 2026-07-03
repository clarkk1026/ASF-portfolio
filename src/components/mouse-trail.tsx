import { useEffect, useRef } from 'react';

type Point = { x: number; y: number };

const HISTORY_MAX = 28;
const SAMPLE_DIST = 2;
const BRIGHTNESS = 0.92;
const WARMTH = 0.35;

const tailColor = (alpha: number) => {
	const r = Math.round(200 + WARMTH * 55);
	const g = Math.round(220 + WARMTH * 20);
	return `rgba(${r}, ${g}, 255, ${alpha * BRIGHTNESS})`;
};

const drawVelocityTail = (
	ctx: CanvasRenderingContext2D,
	headX: number,
	headY: number,
	dirX: number,
	dirY: number,
	speed: number,
) => {
	const tailLen = 55 + Math.min(speed * 11, 150);
	const segments = 24;

	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	ctx.lineCap = 'round';

	const tailX = headX - dirX * tailLen;
	const tailY = headY - dirY * tailLen;

	const wakeGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
	wakeGrad.addColorStop(0, 'rgba(40, 90, 160, 0)');
	wakeGrad.addColorStop(0.5, `rgba(60, 140, 220, ${0.07 * BRIGHTNESS})`);
	wakeGrad.addColorStop(0.8, `rgba(120, 190, 255, ${0.16 * BRIGHTNESS})`);
	wakeGrad.addColorStop(1, `rgba(200, 235, 255, ${0.28 * BRIGHTNESS})`);

	ctx.strokeStyle = wakeGrad;
	ctx.lineWidth = 7 + Math.min(speed * 0.06, 5);
	ctx.beginPath();
	ctx.moveTo(tailX, tailY);
	ctx.lineTo(headX, headY);
	ctx.stroke();

	for (let i = 0; i < segments; i++) {
		const t0 = i / segments;
		const t1 = (i + 1) / segments;
		const fade0 = Math.pow(t0, 3);
		const fade1 = Math.pow(t1, 3);

		const x0 = headX - dirX * tailLen * (1 - t0);
		const y0 = headY - dirY * tailLen * (1 - t0);
		const x1 = headX - dirX * tailLen * (1 - t1);
		const y1 = headY - dirY * tailLen * (1 - t1);

		const segGrad = ctx.createLinearGradient(x0, y0, x1, y1);
		segGrad.addColorStop(0, tailColor(fade0 * 0.55));
		segGrad.addColorStop(1, tailColor(fade1 * 0.82));

		ctx.strokeStyle = segGrad;
		ctx.lineWidth = 0.2 + fade1 * fade1 * 2.4;
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.stroke();
	}

	const hotLen = tailLen * 0.22;
	const hotGrad = ctx.createLinearGradient(
		headX - dirX * hotLen,
		headY - dirY * hotLen,
		headX,
		headY,
	);
	hotGrad.addColorStop(0, `rgba(180, 225, 255, ${0.45 * BRIGHTNESS})`);
	hotGrad.addColorStop(0.6, `rgba(240, 250, 255, ${0.9 * BRIGHTNESS})`);
	hotGrad.addColorStop(1, 'rgba(255, 255, 255, 1)');

	ctx.strokeStyle = hotGrad;
	ctx.lineWidth = 1.6 + Math.min(speed * 0.02, 1);
	ctx.beginPath();
	ctx.moveTo(headX - dirX * hotLen, headY - dirY * hotLen);
	ctx.lineTo(headX, headY);
	ctx.stroke();

	ctx.restore();
};

const drawPathTail = (
	ctx: CanvasRenderingContext2D,
	history: Point[],
	speed: number,
) => {
	if (history.length < 2) return;

	const head = history[0];
	const tail = history[history.length - 1];
	const segments = history.length - 1;

	ctx.save();
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.globalCompositeOperation = 'lighter';

	const wakeGrad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
	wakeGrad.addColorStop(0, 'rgba(30, 80, 160, 0)');
	wakeGrad.addColorStop(0.4, `rgba(55, 130, 210, ${0.08 * BRIGHTNESS})`);
	wakeGrad.addColorStop(0.72, `rgba(100, 180, 255, ${0.2 * BRIGHTNESS})`);
	wakeGrad.addColorStop(1, `rgba(220, 240, 255, ${0.34 * BRIGHTNESS})`);

	ctx.strokeStyle = wakeGrad;
	ctx.lineWidth = 5.5 + Math.min(speed * 0.05, 4);
	ctx.beginPath();
	ctx.moveTo(tail.x, tail.y);
	for (let i = history.length - 2; i >= 0; i--) {
		ctx.lineTo(history[i].x, history[i].y);
	}
	ctx.stroke();

	for (let i = 0; i < segments; i++) {
		const t0 = i / segments;
		const t1 = (i + 1) / segments;
		const fade0 = Math.pow(t0, 2.6);
		const fade1 = Math.pow(t1, 2.6);
		const p0 = history[history.length - 1 - i];
		const p1 = history[history.length - 2 - i];

		const segGrad = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
		segGrad.addColorStop(0, tailColor(fade0 * 0.42));
		segGrad.addColorStop(1, tailColor(fade1 * 0.78));

		ctx.strokeStyle = segGrad;
		ctx.lineWidth = 0.3 + fade1 * 2.2;
		ctx.beginPath();
		ctx.moveTo(p0.x, p0.y);
		ctx.lineTo(p1.x, p1.y);
		ctx.stroke();
	}

	const hotEnd = Math.min(5, segments);
	if (hotEnd > 0) {
		const hotStart = history[hotEnd];
		const hotGrad = ctx.createLinearGradient(hotStart.x, hotStart.y, head.x, head.y);
		hotGrad.addColorStop(0, `rgba(180, 220, 255, ${0.5 * BRIGHTNESS})`);
		hotGrad.addColorStop(0.6, `rgba(240, 250, 255, ${0.92 * BRIGHTNESS})`);
		hotGrad.addColorStop(1, 'rgba(255, 255, 255, 1)');

		ctx.strokeStyle = hotGrad;
		ctx.lineWidth = 1.5 + Math.min(speed * 0.018, 1.2);
		ctx.beginPath();
		ctx.moveTo(hotStart.x, hotStart.y);
		for (let i = hotEnd - 1; i >= 0; i--) {
			ctx.lineTo(history[i].x, history[i].y);
		}
		ctx.stroke();
	}

	ctx.restore();
};

const drawCometHead = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	speed: number,
	time: number,
) => {
	const twinkle = 0.9 + 0.1 * Math.sin(time * 0.002 + 0.4);

	ctx.save();
	ctx.globalCompositeOperation = 'lighter';

	const outerBloom = ctx.createRadialGradient(x, y, 0, x, y, 14);
	outerBloom.addColorStop(0, `rgba(255, 255, 255, ${0.22 * twinkle})`);
	outerBloom.addColorStop(0.35, `rgba(160, 210, 255, ${0.1 * twinkle})`);
	outerBloom.addColorStop(1, 'rgba(31, 120, 220, 0)');
	ctx.fillStyle = outerBloom;
	ctx.beginPath();
	ctx.arc(x, y, 14, 0, Math.PI * 2);
	ctx.fill();

	const bloom = ctx.createRadialGradient(x, y, 0, x, y, 8);
	bloom.addColorStop(0, 'rgba(255, 255, 255, 1)');
	bloom.addColorStop(0.28, `rgba(220, 245, 255, ${0.82 * twinkle})`);
	bloom.addColorStop(0.55, `rgba(100, 180, 255, ${0.3 * twinkle})`);
	bloom.addColorStop(1, 'rgba(31, 120, 220, 0)');
	ctx.fillStyle = bloom;
	ctx.beginPath();
	ctx.arc(x, y, 8, 0, Math.PI * 2);
	ctx.fill();

	const spike = (5.5 + Math.min(speed * 0.08, 2)) * twinkle;
	ctx.strokeStyle = `rgba(220, 240, 255, ${0.28 * twinkle})`;
	ctx.lineWidth = 0.65;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(x - spike, y);
	ctx.lineTo(x + spike, y);
	ctx.moveTo(x, y - spike);
	ctx.lineTo(x, y + spike);
	ctx.stroke();

	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.arc(x, y, 2.2, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
	ctx.beginPath();
	ctx.arc(x, y, 1, 0, Math.PI * 2);
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
		let prevRenderX = -100;
		let prevRenderY = -100;
		let velX = 0;
		let velY = 0;
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

				const follow = 0.44 + Math.min(speed / 26, 0.46);
				renderX += dx * follow;
				renderY += dy * follow;

				const frameDx = renderX - prevRenderX;
				const frameDy = renderY - prevRenderY;
				velX += (frameDx - velX) * 0.32;
				velY += (frameDy - velY) * 0.32;
				prevRenderX = renderX;
				prevRenderY = renderY;

				pushHistory(renderX, renderY);

				const velMag = Math.hypot(velX, velY);
				if (velMag > 0.6) {
					drawVelocityTail(
						ctx,
						renderX,
						renderY,
						velX / velMag,
						velY / velMag,
						speed,
					);
				}

				if (speed > 0.3) {
					drawPathTail(ctx, history, speed);
				}

				drawCometHead(ctx, renderX, renderY, speed, time);
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
