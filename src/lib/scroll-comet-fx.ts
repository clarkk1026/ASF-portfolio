const tailRgb = (warmth: number, alpha: number) => {
	const r = Math.round(195 + warmth * 60);
	const g = Math.round(218 + warmth * 25);
	const b = 255;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
	alphaScale = 1,
) => {
	const len = yEnd - yStart;
	if (len <= 1 || alphaScale <= 0.01) return;

	for (let i = 0; i < steps; i++) {
		const t0 = i / steps;
		const t1 = (i + 1) / steps;
		const mid = (t0 + t1) * 0.5;
		const envelope =
			endFade(mid, fadeStart) * endFade(mid, fadeEnd) * alphaScale;
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

/** Soft elliptical stamps along the tail — organic vapor fade at the tip. */
const drawVividTail = (
	ctx: CanvasRenderingContext2D,
	headX: number,
	headY: number,
	tailX: number,
	tailY: number,
	tailLen: number,
	brightness: number,
	pulse: number,
) => {
	const steps = 42;
	const maxWidth = 3.2 * brightness * pulse;

	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const fade = Math.pow(1 - t, 4.2);
		if (fade < 0.004) continue;

		const x = tailX + (headX - tailX) * t;
		const y = tailY + (headY - tailY) * t;
		const radius = maxWidth * fade * fade + 0.08;
		const warmth = 0.25 + t * 0.75;
		const alpha = fade * brightness * pulse * 0.75;

		const stamp = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.8);
		stamp.addColorStop(0, tailRgb(warmth, alpha * 0.95));
		stamp.addColorStop(0.35, tailRgb(warmth * 0.7, alpha * 0.45));
		stamp.addColorStop(0.7, `rgba(31, 120, 220, ${alpha * 0.12})`);
		stamp.addColorStop(1, 'rgba(20, 60, 120, 0)');

		ctx.fillStyle = stamp;
		ctx.beginPath();
		ctx.ellipse(x, y, radius * 1.15, radius * 2.4, 0, 0, Math.PI * 2);
		ctx.fill();
	}

	const dirX = (headX - tailX) / tailLen;
	const dirY = (headY - tailY) / tailLen;

	// Thin bright core thread
	for (let i = 0; i < 28; i++) {
		const t0 = i / 28;
		const t1 = (i + 1) / 28;
		const fade1 = Math.pow(t1, 3.5);
		const x0 = tailX + (headX - tailX) * t0;
		const y0 = tailY + (headY - tailY) * t0;
		const x1 = tailX + (headX - tailX) * t1;
		const y1 = tailY + (headY - tailY) * t1;

		ctx.strokeStyle = tailRgb(0.5 + t1 * 0.5, fade1 * brightness * pulse * 0.9);
		ctx.lineWidth = 0.08 + fade1 * fade1 * 1.6;
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.stroke();
	}

	// Hot streak at head
	const hotLen = tailLen * 0.18;
	const hotX = headX - dirX * hotLen;
	const hotY = headY - dirY * hotLen;
	const hotGrad = ctx.createLinearGradient(hotX, hotY, headX, headY);
	hotGrad.addColorStop(0, `rgba(150, 210, 255, ${0.4 * brightness})`);
	hotGrad.addColorStop(0.55, `rgba(235, 248, 255, ${0.92 * brightness})`);
	hotGrad.addColorStop(1, 'rgba(255, 255, 255, 1)');
	ctx.strokeStyle = hotGrad;
	ctx.lineWidth = 2;
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
	scrollDir: number,
	velocity: number,
) => {
	const pulse = 0.9 + Math.sin(time * 0.004) * 0.1;
	const speed = Math.min(1.3, Math.abs(scrollDir));
	const moving = velocity > 0.05;

	// Fully hide trail effects when parked at scroll start/end.
	const endpointFade = Math.min(progress / 0.04, (1 - progress) / 0.04, 1);
	const endpointEase = endpointFade * endpointFade * endpointFade;
	const atEndpoint = progress <= 0.012 || progress >= 0.988;

	const tailLen =
		moving && !atEndpoint && endpointEase > 0.02
			? Math.min(190, canvasHeight * 0.2) *
				(0.85 + speed * 0.65) *
				endpointEase *
				Math.min(1, velocity * 1.4)
			: 0;

	// Tail trails opposite to scroll: down scroll → tail up, up scroll → tail down
	const motion = scrollDir === 0 ? 1 : scrollDir;
	const tilt = 0.3;
	const dirY = motion > 0 ? -1 : 1;
	const dirX = -tilt;
	const mag = Math.hypot(dirX, dirY);
	const tailX = headX + (dirX / mag) * tailLen;
	const tailY = headY + (dirY / mag) * tailLen;

	const railX = canvasWidth - 14;
	const edgeTop = 24;
	const edgeBottom = canvasHeight - 24;
	const fade = 0.16;

	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	ctx.lineCap = 'round';

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

	if (progress > 0.005 && !atEndpoint && moving && endpointEase > 0.02) {
		drawFadedStroke(
			ctx,
			railX,
			edgeTop,
			headY,
			2.4,
			(t) => {
				const intensity = 0.2 + t * 0.55 + Math.pow(t, 1.4) * 0.25;
				return `rgba(${Math.round(80 + t * 100)}, ${Math.round(180 + t * 40)}, 255, ${intensity})`;
			},
			fade,
			0.04,
			56,
			endpointEase,
		);

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
			endpointEase * 0.85,
		);
	}

	if (tailLen > 2) {
		drawVividTail(
			ctx,
			headX,
			headY,
			tailX,
			tailY,
			tailLen,
			brightness * endpointEase,
			pulse,
		);
	}

	const bloomR = 11 * pulse;
	const bloom = ctx.createRadialGradient(headX, headY, 0, headX, headY, bloomR);
	bloom.addColorStop(0, 'rgba(255, 255, 255, 1)');
	bloom.addColorStop(0.2, `rgba(225, 245, 255, ${0.9 * brightness})`);
	bloom.addColorStop(0.45, `rgba(31, 195, 255, ${0.4 * brightness})`);
	bloom.addColorStop(0.72, `rgba(130, 100, 255, ${0.14 * brightness})`);
	bloom.addColorStop(1, 'rgba(20, 60, 140, 0)');
	ctx.fillStyle = bloom;
	ctx.beginPath();
	ctx.arc(headX, headY, bloomR, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.arc(headX, headY, 1.6 * pulse, 0, Math.PI * 2);
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

export const createSpark = (
	headX: number,
	headY: number,
	scrollDir: number,
): Spark => ({
	x: headX + (Math.random() - 0.5) * 4,
	y: headY + (Math.random() - 0.5) * 4,
	life: 1,
	vx: -(Math.random() * 1.8 + 0.5),
	vy:
		scrollDir < 0
			? Math.random() * 2.8 + 1
			: -(Math.random() * 2.8 + 1),
	size: Math.random() * 1.3 + 0.5,
});

export const drawSparks = (ctx: CanvasRenderingContext2D, sparks: Spark[]) => {
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';

	for (const spark of sparks) {
		const alpha = spark.life * spark.life * 0.95;
		const glow = ctx.createRadialGradient(
			spark.x,
			spark.y,
			0,
			spark.x,
			spark.y,
			spark.size * 3,
		);
		glow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
		glow.addColorStop(0.3, `rgba(180, 230, 255, ${alpha * 0.55})`);
		glow.addColorStop(1, 'rgba(31, 195, 255, 0)');
		ctx.fillStyle = glow;
		ctx.beginPath();
		ctx.arc(spark.x, spark.y, spark.size * 3, 0, Math.PI * 2);
		ctx.fill();
	}

	ctx.restore();
};

export const tickSparks = (
	sparks: Spark[],
	headX: number,
	headY: number,
	intensity: number,
	scrollDir: number,
) => {
	if (intensity > 0.05) {
		const count = Math.min(6, Math.ceil(intensity * 7));
		for (let i = 0; i < count; i++) {
			sparks.push(createSpark(headX, headY, scrollDir));
		}
	}

	for (let i = sparks.length - 1; i >= 0; i--) {
		sparks[i].x += sparks[i].vx;
		sparks[i].y += sparks[i].vy;
		sparks[i].vy += scrollDir < 0 ? -0.03 : 0.03;
		sparks[i].life -= 0.034;
		if (sparks[i].life <= 0) sparks.splice(i, 1);
	}

	if (sparks.length > 60) sparks.splice(0, sparks.length - 60);
};

export const scrollProgressFromClientY = (
	clientY: number,
	canvasTop: number,
	canvasHeight: number,
	edgePad: number,
) => {
	const track = canvasHeight - edgePad * 2;
	if (track <= 0) return 0;
	const y = clientY - canvasTop - edgePad;
	return Math.min(1, Math.max(0, y / track));
};

export const scrollToProgress = (progress: number) => {
	const docHeight =
		document.documentElement.scrollHeight - window.innerHeight;
	window.scrollTo({ top: docHeight * progress, behavior: 'auto' });
};
