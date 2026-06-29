export type Point = { x: number; y: number };

export type LetterRect = {
	left: number;
	top: number;
	width: number;
	height: number;
	centerX: number;
	centerY: number;
};

export type LightningBolt = {
	segments: Point[][];
	life: number;
	maxLife: number;
	width: number;
	flash: number;
};

export type GlowPulse = {
	x: number;
	y: number;
	radius: number;
	life: number;
	maxLife: number;
};

export type FireParticle = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	size: number;
};

const random = (min: number, max: number) => min + Math.random() * (max - min);

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Recursive midpoint displacement — organic branching lightning. */
const fractalSegment = (
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	displace: number,
	depth: number,
): Point[] => {
	if (depth <= 0 || displace < 1.5) {
		return [
			{ x: x1, y: y1 },
			{ x: x2, y: y2 },
		];
	}

	const mx = (x1 + x2) / 2 + random(-displace, displace);
	const my = (y1 + y2) / 2 + random(-displace * 0.55, displace * 0.55);

	return [
		...fractalSegment(x1, y1, mx, my, displace * 0.58, depth - 1).slice(0, -1),
		...fractalSegment(mx, my, x2, y2, displace * 0.58, depth - 1),
	];
};

const buildBoltPath = (
	x1: number,
	y1: number,
	x2: number,
	y2: number,
): Point[] => {
	const dist = Math.hypot(x2 - x1, y2 - y1);
	const displace = Math.min(42, dist * 0.22);
	return fractalSegment(x1, y1, x2, y2, displace, 6);
};

export const spawnNaturalBolt = (
	width: number,
	height: number,
	letters: LetterRect[],
): LightningBolt => {
	const useLetter = letters.length > 0 && Math.random() > 0.15;
	let x1: number;
	let y1: number;
	let x2: number;
	let y2: number;

	if (useLetter) {
		const target = letters[Math.floor(Math.random() * letters.length)];
		x1 = target.centerX + random(-target.width * 0.25, target.width * 0.25);
		y1 = random(-height * 0.06, target.top + target.height * 0.15);
		x2 = target.centerX + random(-target.width * 0.2, target.width * 0.2);
		y2 = target.top + target.height * random(0.35, 0.88);
	} else {
		x1 = random(width * 0.1, width * 0.9);
		y1 = random(-height * 0.06, height * 0.04);
		x2 = x1 + random(-width * 0.18, width * 0.18);
		y2 = random(height * 0.45, height * 0.98);
	}

	const main = buildBoltPath(x1, y1, x2, y2);
	const segments: Point[][] = [main];

	if (Math.random() > 0.4 && main.length > 4) {
		const pivot = main[Math.floor(main.length * random(0.3, 0.65))];
		const branchEnd = {
			x: pivot.x + random(-55, 55),
			y: pivot.y + random(18, 55),
		};
		segments.push(buildBoltPath(pivot.x, pivot.y, branchEnd.x, branchEnd.y));
	}

	const maxLife = random(14, 28);

	return {
		segments,
		life: maxLife,
		maxLife,
		width: random(1.5, 2.5),
		flash: random(0.6, 1),
	};
};

export const spawnGlowPulse = (x: number, y: number): GlowPulse => ({
	x,
	y,
	radius: random(16, 28),
	life: random(12, 20),
	maxLife: 20,
});

const strokeLightning = (
	ctx: CanvasRenderingContext2D,
	points: Point[],
	width: number,
	alpha: number,
) => {
	if (points.length < 2 || alpha <= 0.02) return;

	const draw = (lineWidth: number, color: string, a: number) => {
		ctx.save();
		ctx.globalCompositeOperation = 'lighter';
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctx.strokeStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.globalAlpha = a;
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i += 1) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.stroke();
		ctx.restore();
	};

	draw(width * 9, 'rgba(30, 90, 220, 0.45)', alpha * 0.55);
	draw(width * 3.2, 'rgba(70, 160, 255, 0.8)', alpha * 0.88);
	draw(width * 1.1, 'rgba(180, 230, 255, 1)', alpha * 0.96);
	draw(width * 0.4, 'rgba(255, 255, 255, 1)', alpha);
};

export const drawLightningBolt = (ctx: CanvasRenderingContext2D, bolt: LightningBolt) => {
	const lifeT = bolt.life / bolt.maxLife;
	if (lifeT <= 0) return;

	const flicker = 0.82 + Math.sin(bolt.flash * 22) * 0.14 + Math.sin(bolt.flash * 47) * 0.06;
	const peak = Math.pow(lifeT, 0.5);
	const alpha = peak * flicker * 1.12;

	for (const segment of bolt.segments) {
		strokeLightning(ctx, segment, bolt.width, alpha);
	}
};

export const drawGlowPulse = (ctx: CanvasRenderingContext2D, pulse: GlowPulse) => {
	const t = pulse.life / pulse.maxLife;
	if (t <= 0) return;

	const alpha = smoothstep(t) * 0.52;
	const gradient = ctx.createRadialGradient(
		pulse.x,
		pulse.y,
		0,
		pulse.x,
		pulse.y,
		pulse.radius,
	);
	gradient.addColorStop(0, `rgba(180, 230, 255, ${alpha})`);
	gradient.addColorStop(0.35, `rgba(60, 150, 255, ${alpha * 0.65})`);
	gradient.addColorStop(0.7, `rgba(30, 80, 200, ${alpha * 0.28})`);
	gradient.addColorStop(1, 'rgba(15, 40, 100, 0)');

	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
};

export const spawnFireParticle = (x: number, y: number, width: number): FireParticle => {
	const spread = width * 0.35;
	return {
		x: x + random(-spread, spread),
		y: y + random(-2, 6),
		vx: random(-0.7, 0.7),
		vy: random(-2.2, -0.6),
		life: random(24, 44),
		maxLife: 44,
		size: random(1.8, 4.2),
	};
};

export const drawFireParticle = (ctx: CanvasRenderingContext2D, particle: FireParticle) => {
	const t = particle.life / particle.maxLife;
	if (t <= 0) return;

	const alpha = smoothstep(t);
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	ctx.globalAlpha = alpha;

	const gradient = ctx.createRadialGradient(
		particle.x,
		particle.y,
		0,
		particle.x,
		particle.y,
		particle.size * 2.2,
	);
	gradient.addColorStop(0, `rgba(160, 230, 255, ${alpha})`);
	gradient.addColorStop(0.35, `rgba(50, 140, 255, ${alpha * 0.8})`);
	gradient.addColorStop(1, 'rgba(15, 40, 110, 0)');

	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.arc(particle.x, particle.y, particle.size * 2.2, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
};
