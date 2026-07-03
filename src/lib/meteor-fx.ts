export type Meteor = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	length: number;
	coreWidth: number;
	brightness: number;
	warmth: number;
};

const random = (min: number, max: number) => min + Math.random() * (max - min);

export const spawnMeteor = (width: number, height: number): Meteor => {
	const speed = random(9, 16);
	const angle = Math.PI / 4 + random(-0.06, 0.06);

	return {
		x: random(width * 0.08, width * 0.92),
		y: random(-120, height * 0.22),
		vx: Math.cos(angle) * speed,
		vy: Math.sin(angle) * speed,
		length: random(140, 260) + speed * 8,
		coreWidth: random(0.9, 1.6),
		brightness: random(0.72, 1),
		warmth: random(0, 1),
	};
};

const tailColor = (warmth: number, alpha: number) => {
	const r = Math.round(200 + warmth * 55);
	const g = Math.round(220 + warmth * 20);
	const b = 255;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const drawMeteor = (ctx: CanvasRenderingContext2D, meteor: Meteor) => {
	const speed = Math.hypot(meteor.vx, meteor.vy) || 1;
	const dirX = meteor.vx / speed;
	const dirY = meteor.vy / speed;
	const headX = meteor.x;
	const headY = meteor.y;
	const tailLen = meteor.length;
	const segments = 28;

	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	ctx.lineCap = 'round';

	// Soft atmospheric wake — wide, faint, fades long before the head
	const wakeGrad = ctx.createLinearGradient(
		headX - dirX * tailLen,
		headY - dirY * tailLen,
		headX,
		headY,
	);
	wakeGrad.addColorStop(0, 'rgba(40, 90, 160, 0)');
	wakeGrad.addColorStop(0.55, `rgba(60, 140, 220, ${0.04 * meteor.brightness})`);
	wakeGrad.addColorStop(0.82, `rgba(120, 190, 255, ${0.1 * meteor.brightness})`);
	wakeGrad.addColorStop(1, `rgba(200, 235, 255, ${0.16 * meteor.brightness})`);

	ctx.strokeStyle = wakeGrad;
	ctx.lineWidth = meteor.coreWidth * 5.5;
	ctx.beginPath();
	ctx.moveTo(headX - dirX * tailLen, headY - dirY * tailLen);
	ctx.lineTo(headX, headY);
	ctx.stroke();

	// Tapered core tail — exponential brightness toward the head
	for (let i = 0; i < segments; i++) {
		const t0 = i / segments;
		const t1 = (i + 1) / segments;
		const fade0 = Math.pow(t0, 3.2);
		const fade1 = Math.pow(t1, 3.2);
		const alpha0 = fade0 * meteor.brightness * 0.62;
		const alpha1 = fade1 * meteor.brightness * 0.85;
		const width0 = 0.12 + fade0 * fade0 * meteor.coreWidth;
		const width1 = 0.12 + fade1 * fade1 * meteor.coreWidth;

		const x0 = headX - dirX * tailLen * (1 - t0);
		const y0 = headY - dirY * tailLen * (1 - t0);
		const x1 = headX - dirX * tailLen * (1 - t1);
		const y1 = headY - dirY * tailLen * (1 - t1);

		const segmentGrad = ctx.createLinearGradient(x0, y0, x1, y1);
		segmentGrad.addColorStop(0, tailColor(meteor.warmth, alpha0));
		segmentGrad.addColorStop(1, tailColor(meteor.warmth, alpha1));

		ctx.strokeStyle = segmentGrad;
		ctx.lineWidth = (width0 + width1) * 0.5;
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.stroke();
	}

	// Hot inner streak — only the last ~18% of the tail
	const hotLen = tailLen * 0.18;
	const hotGrad = ctx.createLinearGradient(
		headX - dirX * hotLen,
		headY - dirY * hotLen,
		headX,
		headY,
	);
	hotGrad.addColorStop(0, `rgba(180, 225, 255, ${0.35 * meteor.brightness})`);
	hotGrad.addColorStop(0.6, `rgba(240, 250, 255, ${0.85 * meteor.brightness})`);
	hotGrad.addColorStop(1, 'rgba(255, 255, 255, 1)');

	ctx.strokeStyle = hotGrad;
	ctx.lineWidth = meteor.coreWidth * 1.15;
	ctx.beginPath();
	ctx.moveTo(headX - dirX * hotLen, headY - dirY * hotLen);
	ctx.lineTo(headX, headY);
	ctx.stroke();

	// Head bloom — tight, not a big cartoon dot
	const bloom = ctx.createRadialGradient(headX, headY, 0, headX, headY, 5);
	bloom.addColorStop(0, 'rgba(255, 255, 255, 1)');
	bloom.addColorStop(0.25, `rgba(220, 245, 255, ${0.75 * meteor.brightness})`);
	bloom.addColorStop(0.55, `rgba(100, 180, 255, ${0.22 * meteor.brightness})`);
	bloom.addColorStop(1, 'rgba(31, 120, 220, 0)');
	ctx.fillStyle = bloom;
	ctx.beginPath();
	ctx.arc(headX, headY, 5, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.arc(headX, headY, 1.1, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
};

export type BurstParticle = {
	x: number;
	y: number;
	prevX: number;
	prevY: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	size: number;
};

export type MeteorBurst = {
	x: number;
	y: number;
	flash: number;
	flashRadius: number;
	warmth: number;
	brightness: number;
	particles: BurstParticle[];
	shards: BurstParticle[];
};

let activeBursts: MeteorBurst[] = [];

const burstColor = (warmth: number, alpha: number) => {
	const r = Math.round(210 + warmth * 45);
	const g = Math.round(228 + warmth * 18);
	return `rgba(${r}, ${g}, 255, ${alpha})`;
};

export const spawnMeteorBurst = (
	meteor: Meteor,
	x: number,
	y: number,
) => {
	const speed = Math.hypot(meteor.vx, meteor.vy) || 1;
	const dirX = meteor.vx / speed;
	const dirY = meteor.vy / speed;
	const perpX = -dirY;
	const perpY = dirX;

	const particles: BurstParticle[] = Array.from({ length: 22 }, () => {
		const forward = random(0.5, 2.6);
		const lateral = random(-2.2, 2.2);
		let vx = dirX * forward + perpX * lateral;
		let vy = dirY * forward + perpY * lateral;
		const mag = Math.hypot(vx, vy) || 1;
		const particleSpeed = random(4, 12) + speed * 0.18;
		vx = (vx / mag) * particleSpeed;
		vy = (vy / mag) * particleSpeed;

		return {
			x,
			y,
			prevX: x,
			prevY: y,
			vx,
			vy,
			life: 0,
			maxLife: random(18, 42),
			size: random(0.7, 2.4),
		};
	});

	const shards: BurstParticle[] = Array.from({ length: 8 }, () => {
		const spread = random(-0.5, 0.5);
		const shardSpeed = random(5, 14) + speed * 0.25;
		const angle = Math.atan2(dirY, dirX) + spread;

		return {
			x,
			y,
			prevX: x - dirX * random(8, 28),
			prevY: y - dirY * random(8, 28),
			vx: Math.cos(angle) * shardSpeed,
			vy: Math.sin(angle) * shardSpeed,
			life: 0,
			maxLife: random(10, 22),
			size: random(1.2, 3),
		};
	});

	activeBursts.push({
		x,
		y,
		flash: 1,
		flashRadius: 6,
		warmth: meteor.warmth,
		brightness: meteor.brightness,
		particles,
		shards,
	});

	if (activeBursts.length > 8) {
		activeBursts = activeBursts.slice(-8);
	}
};

export const updateMeteorBursts = (dt: number) => {
	activeBursts = activeBursts
		.map((burst) => {
			burst.flash = Math.max(0, burst.flash - 0.07 * dt);
			burst.flashRadius += (38 - burst.flashRadius) * 0.14 * dt;

			const advance = (items: BurstParticle[]) => {
				for (const particle of items) {
					particle.prevX = particle.x;
					particle.prevY = particle.y;
					particle.x += particle.vx * dt;
					particle.y += particle.vy * dt;
					particle.vx *= 0.94;
					particle.vy *= 0.94;
					particle.vy += 0.06 * dt;
					particle.life += dt;
				}
			};

			advance(burst.particles);
			advance(burst.shards);

			return burst;
		})
		.filter(
			(burst) =>
				burst.flash > 0.02 ||
				burst.particles.some((p) => p.life < p.maxLife) ||
				burst.shards.some((p) => p.life < p.maxLife),
		);
};

export const drawMeteorBursts = (ctx: CanvasRenderingContext2D) => {
	if (activeBursts.length === 0) return;

	ctx.save();
	ctx.globalCompositeOperation = 'lighter';

	for (const burst of activeBursts) {
		if (burst.flash > 0.02) {
			const flashAlpha = burst.flash * burst.brightness;
			const ring = ctx.createRadialGradient(
				burst.x,
				burst.y,
				0,
				burst.x,
				burst.y,
				burst.flashRadius,
			);
			ring.addColorStop(0, `rgba(255, 255, 255, ${0.85 * flashAlpha})`);
			ring.addColorStop(0.2, `rgba(220, 242, 255, ${0.55 * flashAlpha})`);
			ring.addColorStop(0.5, `rgba(120, 190, 255, ${0.18 * flashAlpha})`);
			ring.addColorStop(1, 'rgba(31, 120, 220, 0)');
			ctx.fillStyle = ring;
			ctx.beginPath();
			ctx.arc(burst.x, burst.y, burst.flashRadius, 0, Math.PI * 2);
			ctx.fill();
		}

		for (const particle of burst.particles) {
			const t = 1 - particle.life / particle.maxLife;
			if (t <= 0) continue;

			const alpha = t * t * burst.brightness;
			ctx.strokeStyle = burstColor(burst.warmth, alpha * 0.55);
			ctx.lineWidth = particle.size * 0.7;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(particle.prevX, particle.prevY);
			ctx.lineTo(particle.x, particle.y);
			ctx.stroke();

			ctx.fillStyle = burstColor(burst.warmth, alpha);
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.size * 0.45, 0, Math.PI * 2);
			ctx.fill();
		}

		for (const shard of burst.shards) {
			const t = 1 - shard.life / shard.maxLife;
			if (t <= 0) continue;

			const alpha = t * burst.brightness;
			const grad = ctx.createLinearGradient(
				shard.prevX,
				shard.prevY,
				shard.x,
				shard.y,
			);
			grad.addColorStop(0, `rgba(180, 220, 255, ${alpha * 0.2})`);
			grad.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.95})`);

			ctx.strokeStyle = grad;
			ctx.lineWidth = shard.size * 0.55;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(shard.prevX, shard.prevY);
			ctx.lineTo(shard.x, shard.y);
			ctx.stroke();
		}
	}

	ctx.restore();
};
