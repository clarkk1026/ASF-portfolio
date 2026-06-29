export type Point = { x: number; y: number };

export type LightningBolt = {
	points: Point[];
	life: number;
	maxLife: number;
	width: number;
	branch?: LightningBolt;
};

export type FireParticle = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	size: number;
	hue: number;
};

const random = (min: number, max: number) => min + Math.random() * (max - min);

export const createLightningPath = (
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	displace: number,
	depth = 6,
): Point[] => {
	const midX = (x1 + x2) / 2 + random(-displace, displace);
	const midY = (y1 + y2) / 2 + random(-displace * 0.55, displace * 0.55);

	if (depth <= 0) return [{ x: x1, y: y1 }, { x: x2, y: y2 }];

	return [
		...createLightningPath(x1, y1, midX, midY, displace * 0.62, depth - 1).slice(0, -1),
		...createLightningPath(midX, midY, x2, y2, displace * 0.62, depth - 1),
	];
};

export const spawnLightningBolt = (
	width: number,
	height: number,
): LightningBolt => {
	const edge = Math.floor(Math.random() * 4);
	let x1: number;
	let y1: number;
	let x2: number;
	let y2: number;

	if (edge === 0) {
		x1 = random(0, width);
		y1 = 0;
		x2 = random(width * 0.15, width * 0.85);
		y2 = random(height * 0.35, height);
	} else if (edge === 1) {
		x1 = width;
		y1 = random(0, height);
		x2 = random(0, width * 0.85);
		y2 = random(height * 0.2, height);
	} else if (edge === 2) {
		x1 = random(0, width);
		y1 = height;
		x2 = random(width * 0.1, width * 0.9);
		y2 = random(0, height * 0.75);
	} else {
		x1 = 0;
		y1 = random(0, height);
		x2 = random(width * 0.15, width);
		y2 = random(height * 0.15, height * 0.85);
	}

	const points = createLightningPath(x1, y1, x2, y2, random(28, 58));
	const maxLife = random(8, 18);

	let branch: LightningBolt | undefined;
	if (Math.random() > 0.45 && points.length > 4) {
		const pivot = points[Math.floor(points.length * random(0.25, 0.65))];
		const branchPoints = createLightningPath(
			pivot.x,
			pivot.y,
			pivot.x + random(-50, 50),
			pivot.y + random(-35, 45),
			random(16, 32),
			4,
		);
		branch = {
			points: branchPoints,
			life: maxLife * 0.85,
			maxLife: maxLife * 0.85,
			width: random(0.8, 1.4),
		};
	}

	return {
		points,
		life: maxLife,
		maxLife,
		width: random(1.2, 2.4),
		branch,
	};
};

export const spawnFireParticle = (
	x: number,
	y: number,
	width: number,
): FireParticle => {
	const spread = width * 0.45;
	return {
		x: x + random(-spread, spread),
		y: y + random(-6, 10),
		vx: random(-1.8, 1.8),
		vy: random(-4.5, -1.2),
		life: random(22, 42),
		maxLife: 42,
		size: random(2, 5.5),
		hue: random(185, 285),
	};
};

export const drawLightningBolt = (
	ctx: CanvasRenderingContext2D,
	bolt: LightningBolt,
) => {
	const alpha = bolt.life / bolt.maxLife;
	if (alpha <= 0) return;

	const drawPath = (points: Point[], width: number, core: string, glow: string) => {
		if (points.length < 2) return;

		ctx.save();
		ctx.globalCompositeOperation = 'lighter';
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';

		ctx.shadowBlur = 18;
		ctx.shadowColor = glow;
		ctx.strokeStyle = glow;
		ctx.lineWidth = width * 4.5;
		ctx.globalAlpha = alpha * 0.45;
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i += 1) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.stroke();

		ctx.shadowBlur = 8;
		ctx.strokeStyle = core;
		ctx.lineWidth = width;
		ctx.globalAlpha = alpha;
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i += 1) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.stroke();

		ctx.restore();
	};

	drawPath(bolt.points, bolt.width, 'rgba(220, 245, 255, 0.95)', 'rgba(31, 195, 255, 0.9)');
	if (bolt.branch) {
		drawPath(
			bolt.branch.points,
			bolt.branch.width,
			'rgba(200, 230, 255, 0.85)',
			'rgba(120, 160, 255, 0.75)',
		);
	}
};

export const drawFireParticle = (
	ctx: CanvasRenderingContext2D,
	particle: FireParticle,
) => {
	const t = particle.life / particle.maxLife;
	if (t <= 0) return;

	const alpha = t * t;
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
	gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 88%, ${alpha})`);
	gradient.addColorStop(0.35, `hsla(${particle.hue}, 95%, 62%, ${alpha * 0.75})`);
	gradient.addColorStop(1, `hsla(${particle.hue + 20}, 90%, 45%, 0)`);

	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.arc(particle.x, particle.y, particle.size * 2.2, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
};
