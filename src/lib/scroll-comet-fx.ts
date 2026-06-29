const tailRgb = (warmth: number, alpha: number) => {
	const r = Math.round(195 + warmth * 60);
	const g = Math.round(218 + warmth * 25);
	const b = 255;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** Smooth fade-in at start (t=0) and fade-out at end (t=1) of a 0–1 range. */
const endFade = (t: number, fade = 0.14) => {
	if (t < fade) return t / fade;
	if (t > 1 - fade) return (1 - t) / fade;
	return 1;
};

const drawFadedStroke = (
	ctx: CanvasRenderingContext2D,
	x: number,
	yStart: number,
	yEnd: number,
	width: number,
	colorAt: (t: number) => string,
	fadeStart = 0.14,
	fadeEnd = 0.14,
	steps = 48,
) => {
	const len = yEnd - yStart;
	if (len <= 1) return;

	for (let i = 0; i < steps; i++) {
		const t0 = i / steps;
		const t1 = (i + 1) / steps;
		const mid = (t0 + t1) * 0.5;
		const envelope = endFade(mid, fadeStart) * endFade(mid, fadeEnd);
		if (envelope < 0.01) continue;

		const sy0 = yStart + len * t0;
		const sy1 = yStart + len * t1;

		ctx.strokeStyle = colorAt(mid);
		ctx.globalAlpha = envelope;
		ctx.lineWidth = width * (0.55 + envelope * 0.45);
		ctx.beginPath();
		ctx.moveTo(x, sy0);
		ctx.lineTo(x, sy1);
		ctx.stroke();
	}

	ctx.globalAlpha = 1;
};

const drawCometTail = (
	ctx: CanvasRenderingContext2D,
	headX: number,
	headY: number,
	tailX: number,
	tailY: number,
	tailLen: number,
	brightness: number,
	pulse: number,
) => {
	const segments = 34;
	const dirX = (headX - tailX) / tailLen;
	const dirY = (headY - tailY) / tailLen;

	// Wide diffuse wake — invisible at tip
	const wakeGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
	wakeGrad.addColorStop(0, 'rgba(20, 50, 100, 0)');
	wakeGrad.addColorStop(0.35, 'rgba(40, 90, 160, 0)');
	wakeGrad.addColorStop(0.62, `rgba(55, 120, 210, ${0.04 * brightness})`);
	wakeGrad.addColorStop(0.85, `rgba(100, 180, 255, ${0.12 * brightness})`);
	wakeGrad.addColorStop(1, `rgba(210, 240, 255, ${0.2 * brightness})`);
	ctx.strokeStyle = wakeGrad;
	ctx.lineWidth = 8;
	ctx.beginPath();
	ctx.moveTo(tailX, tailY);
	ctx.lineTo(headX, headY);
	ctx.stroke();

	// Core tail segments — exponential fade, tip fully vanishes
	for (let i = 0; i < segments; i++) {
		const t0 = i / segments;
		const t1 = (i + 1) / segments;
		const fade0 = Math.pow(t0, 3.8);
		const fade1 = Math.pow(t1, 3.8);
		if (fade1 < 0.008 && fade0 < 0.008) continue;

		const alpha0 = fade0 * brightness * pulse * 0.55;
		const alpha1 = fade1 * brightness * pulse * 0.92;
		const width0 = 0.1 + fade0 * fade0 * 2.4;
		const width1 = 0.1 + fade1 * fade1 * 2.4;

		const x0 = tailX + (headX - tailX) * t0;
		const y0 = tailY + (headY - tailY) * t0;
		const x1 = tailX + (headX - tailX) * t1;
		const y1 = tailY + (headY - tailY) * t1;

		const warmth = 0.3 + t1 * 0.7;
		const segGrad = ctx.createLinearGradient(x0, y0, x1, y1);
		segGrad.addColorStop(0, tailRgb(warmth * 0.35, alpha0));
		segGrad.addColorStop(1, tailRgb(warmth, alpha1));

		ctx.strokeStyle = segGrad;
		ctx.lineWidth = (width0 + width1) * 0.5;
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.stroke();
	}

	// Hot inner streak — last 20% only
	const hotLen = tailLen * 0.2;
	const hotX = headX - dirX * hotLen;
	const hotY = headY - dirY * hotLen;
	const hotGrad = ctx.createLinearGradient(hotX, hotY, headX, headY);
	hotGrad.addColorStop(0, `rgba(160, 215, 255, ${0.35 * brightness})`);
	hotGrad.addColorStop(0.5, `rgba(230, 248, 255, ${0.88 * brightness})`);
	hotGrad.addColorStop(1, 'rgba(255, 255, 255, 1)');
	ctx.strokeStyle = hotGrad;
	ctx.lineWidth = 1.8;
	ctx.beginPath();
	ctx.moveTo(hotX, hotY);
	ctx.lineTo(headX, headY);
	ctx.stroke();
};

export const drawScrollComet = (
	ctx: CanvasRenderingContext2D,
	headX: number,
	headY: number,
	canvasWidth: number,
	canvasHeight: number,
	progress: number,
	brightness: number,
	time: number,
) => {
	const pulse = 0.88 + Math.sin(time * 0.004) * 0.12;
	const tailLen =
		Math.min(165, canvasHeight * 0.18) * (0.92 + brightness * 0.5);
	const tailAngle = -0.36;
	const tailX = headX + Math.sin(tailAngle) * tailLen;
	const tailY = headY - Math.cos(tailAngle) * tailLen;
	const railX = canvasWidth - 14;
	const edgeTop = 24;
	const edgeBottom = canvasHeight - 24;
	const fade = 0.16;

	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	ctx.lineCap = 'round';

	// Full-height guide rail — fades out at both ends
	drawFadedStroke(
		ctx,
		railX,
		edgeTop,
		edgeBottom,
		1.2,
		(t) => {
			const core = 0.04 + Math.sin(t * Math.PI) * 0.07;
			return `rgba(100, 170, 255, ${core})`;
		},
		fade,
		fade,
	);

	// Traveled path — fades in from top, brightens toward head
	if (progress > 0.005) {
		drawFadedStroke(
			ctx,
			railX,
			edgeTop,
			headY,
			2.4,
			(t) => {
				const intensity =
					0.2 + t * 0.55 + Math.pow(t, 1.4) * 0.25;
				return `rgba(${Math.round(80 + t * 100)}, ${Math.round(180 + t * 40)}, 255, ${intensity})`;
			},
			fade,
			0.04,
			56,
		);

		// Soft aurora beside traveled path
		drawFadedStroke(
			ctx,
			railX - 1,
			edgeTop,
			headY,
			12,
			(t) => `rgba(80, 160, 255, ${0.04 + t * 0.06})`,
			fade * 1.2,
			0.06,
			40,
		);
	}

	// Comet tail — drawn on top of rail at scroll head (not a continuation of the line)
	drawCometTail(
		ctx,
		headX,
		headY,
		tailX,
		tailY,
		tailLen,
		brightness,
		pulse,
	);

	// Head bloom
	const bloomR = 10 * pulse;
	const bloom = ctx.createRadialGradient(headX, headY, 0, headX, headY, bloomR);
	bloom.addColorStop(0, 'rgba(255, 255, 255, 1)');
	bloom.addColorStop(0.22, `rgba(225, 245, 255, ${0.88 * brightness})`);
	bloom.addColorStop(0.5, `rgba(31, 195, 255, ${0.35 * brightness})`);
	bloom.addColorStop(0.75, `rgba(120, 90, 255, ${0.12 * brightness})`);
	bloom.addColorStop(1, 'rgba(20, 60, 140, 0)');
	ctx.fillStyle = bloom;
	ctx.beginPath();
	ctx.arc(headX, headY, bloomR, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.arc(headX, headY, 1.5 * pulse, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
};

export type Spark = {
	x: number;
	y: number;
	life: number;
	vx: number;
	vy: number;
	size: number;
};

export const createSpark = (headX: number, headY: number): Spark => ({
	x: headX + (Math.random() - 0.5) * 3,
	y: headY + (Math.random() - 0.5) * 3,
	life: 1,
	vx: -(Math.random() * 1.6 + 0.4),
	vy: -(Math.random() * 2.4 + 0.8),
	size: Math.random() * 1.1 + 0.5,
});

export const drawSparks = (ctx: CanvasRenderingContext2D, sparks: Spark[]) => {
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';

	for (const spark of sparks) {
		const alpha = spark.life * spark.life * 0.9;
		const glow = ctx.createRadialGradient(
			spark.x,
			spark.y,
			0,
			spark.x,
			spark.y,
			spark.size * 2.8,
		);
		glow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
		glow.addColorStop(0.35, `rgba(170, 225, 255, ${alpha * 0.45})`);
		glow.addColorStop(1, 'rgba(31, 195, 255, 0)');
		ctx.fillStyle = glow;
		ctx.beginPath();
		ctx.arc(spark.x, spark.y, spark.size * 2.8, 0, Math.PI * 2);
		ctx.fill();
	}

	ctx.restore();
};

export const tickSparks = (
	sparks: Spark[],
	headX: number,
	headY: number,
	intensity: number,
) => {
	if (intensity > 0.06) {
		const count = Math.min(5, Math.ceil(intensity * 6));
		for (let i = 0; i < count; i++) {
			sparks.push(createSpark(headX, headY));
		}
	}

	for (let i = sparks.length - 1; i >= 0; i--) {
		sparks[i].x += sparks[i].vx;
		sparks[i].y += sparks[i].vy;
		sparks[i].vy += 0.035;
		sparks[i].life -= 0.036;
		if (sparks[i].life <= 0) sparks.splice(i, 1);
	}

	if (sparks.length > 55) sparks.splice(0, sparks.length - 55);
};
