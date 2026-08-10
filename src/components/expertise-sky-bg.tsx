import { useEffect, useRef } from 'react';

type SkyStar = {
	x: number;
	y: number;
	r: number;
	base: number;
	speed: number;
	phase: number;
	temperature: number;
	spike: boolean;
};

type FlyingLantern = {
	label: string;
	isAi: boolean;
	hue: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	drawW: number;
	drawH: number;
	sizeBias: number;
	phase: number;
	driftAmp: number;
	driftFreq: number;
	swayAmp: number;
	z: number;
	windPhase: number;
	windFreq: number;
	liftPhase: number;
	sprite: HTMLCanvasElement;
};

type LanternDrag = {
	lantern: FlyingLantern;
	offsetX: number;
	offsetY: number;
	pointerId: number;
	lastX: number;
	lastY: number;
	lastT: number;
	velX: number;
	velY: number;
	targetX: number;
	targetY: number;
};

const INTERACTIVE_LANTERN_BLOCK =
	'a,button,input,textarea,select,label,summary,[role="button"],[role="link"],.navbar,.comet-btn,.ai-bot,.visitor-contact-modal-root';

const isLanternBlockedTarget = (target: EventTarget | null) => {
	if (!(target instanceof Element)) return true;
	return Boolean(target.closest(INTERACTIVE_LANTERN_BLOCK));
};

/**
 * One lantern per What We Build area — unique name, tint, and scale.
 * No duplicates.
 */
const LANTERN_DEFS = [
	{
		label: 'AI',
		isAi: true,
		hue: 165,
		sizeMul: 1.18,
		slot: 0.48,
	},
	{
		label: 'Backend APIs',
		isAi: false,
		hue: -12,
		sizeMul: 1.08,
		slot: 0.18,
	},
	{
		label: 'Front End',
		isAi: false,
		hue: 18,
		sizeMul: 1.0,
		slot: 0.72,
	},
	{
		label: 'Shopify',
		isAi: false,
		hue: 55,
		sizeMul: 0.96,
		slot: 0.32,
	},
	{
		label: 'Full Stack',
		isAi: false,
		hue: -28,
		sizeMul: 1.1,
		slot: 0.62,
	},
] as const;

const LABEL_FONT = '"Cinzel", "Times New Roman", serif';
const LABEL_FIT = 0.72;
const STAR_COUNT = 148;
const FAR_STAR_COUNT = 90;
const PAINT_MS = 1000 / 48;
const FIREFLIES_PER_LANTERN = 14;
const AMBIENT_FIREFLY_COUNT = 28;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const loadImage = (src: string) =>
	new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.decoding = 'async';
		img.onload = () => {
			if (img.decode) {
				img.decode()
					.then(() => resolve(img))
					.catch(() => resolve(img));
			} else {
				resolve(img);
			}
		};
		img.onerror = reject;
		img.src = src;
	});

/** Warm the lantern body as soon as this module loads (before route click). */
let cachedBodyImg: HTMLImageElement | null = null;
const bodyImgReady = loadImage('/lanterns/lantern-body.webp')
	.then((img) => {
		cachedBodyImg = img;
		return img;
	})
	.catch(() => null);

void bodyImgReady;
if (typeof document !== 'undefined' && document.fonts?.load) {
	void document.fonts.load(`700 32px ${LABEL_FONT}`);
}

const preferredFontSize = (label: string, view: number, isAi: boolean) => {
	const len = label.length;
	const base = isAi ? view * 0.024 : view * 0.02;
	if (len <= 5) return Math.max(14, Math.min(26, base * 1.2));
	if (len <= 9) return Math.max(13, Math.min(22, base));
	return Math.max(12, Math.min(18, base * 0.9));
};

const createGlowSprite = () => {
	const sprite = document.createElement('canvas');
	sprite.width = 48;
	sprite.height = 48;
	const gctx = sprite.getContext('2d');
	if (gctx) {
		const glow = gctx.createRadialGradient(24, 24, 0, 24, 24, 24);
		glow.addColorStop(0, 'rgba(245, 250, 255, 1)');
		glow.addColorStop(0.28, 'rgba(180, 220, 255, 0.45)');
		glow.addColorStop(0.6, 'rgba(100, 170, 255, 0.12)');
		glow.addColorStop(1, 'rgba(80, 150, 255, 0)');
		gctx.fillStyle = glow;
		gctx.fillRect(0, 0, 48, 48);
	}
	return sprite;
};

const starGlowSprite = createGlowSprite();

/** Realistic starfield with frequent natural shine / twinkle. */
const createStars = (width: number, height: number): SkyStar[] => {
	const near = Array.from({ length: STAR_COUNT }, () => {
		const bright = Math.random() > 0.86;
		const mid = !bright && Math.random() > 0.45;
		return {
			x: Math.random() * width,
			y: Math.random() ** 1.05 * height * 0.92,
			r: bright
				? rand(0.75, 1.35)
				: mid
					? rand(0.42, 0.8)
					: rand(0.22, 0.5),
			base: bright
				? rand(0.52, 0.88)
				: mid
					? rand(0.32, 0.58)
					: rand(0.2, 0.42),
			speed: bright ? rand(2.2, 4.8) : rand(1.3, 3.6),
			phase: rand(0, Math.PI * 2),
			temperature: rand(0.08, 0.7),
			spike: bright,
		};
	});

	const far = Array.from({ length: FAR_STAR_COUNT }, () => ({
		x: Math.random() * width,
		y: Math.random() * height * 0.95,
		r: rand(0.12, 0.32),
		base: rand(0.12, 0.28),
		speed: rand(0.6, 1.8),
		phase: rand(0, Math.PI * 2),
		temperature: rand(0.2, 0.55),
		spike: false,
	}));

	return [...far, ...near];
};

const drawSkyStars = (
	ctx: CanvasRenderingContext2D,
	stars: SkyStar[],
	time: number,
) => {
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';

	for (const star of stars) {
		const t = time * 0.001;
		const wave =
			0.5 +
			0.5 *
				Math.sin(t * star.speed + star.phase) *
				(0.65 + 0.35 * Math.sin(t * star.speed * 1.85 + star.phase * 0.6));
		const shimmer = Math.pow(Math.max(0, wave), 3.1);
		const pulse = Math.pow(Math.max(0, wave), 1.7);
		const alpha = Math.min(
			1,
			star.base * (0.36 + pulse * 0.64) + shimmer * 0.78,
		);
		const red = Math.round(220 + star.temperature * 35);
		const green = Math.round(232 + star.temperature * 18);
		const coreR = star.r * (0.85 + shimmer * 0.48);

		const glowR = coreR * (3.4 + shimmer * 3.8);
		ctx.globalAlpha = alpha * (0.24 + shimmer * 0.42);
		ctx.drawImage(
			starGlowSprite,
			star.x - glowR,
			star.y - glowR,
			glowR * 2,
			glowR * 2,
		);

		ctx.globalAlpha = alpha;
		ctx.fillStyle = `rgba(${red}, ${green}, 255, 1)`;
		ctx.beginPath();
		ctx.arc(star.x, star.y, coreR, 0, Math.PI * 2);
		ctx.fill();

		if (star.spike || shimmer > 0.38) {
			ctx.globalAlpha = alpha * (0.55 + shimmer * 0.42);
			ctx.fillStyle = 'rgba(255, 255, 255, 1)';
			ctx.beginPath();
			ctx.arc(star.x, star.y, coreR * 0.4, 0, Math.PI * 2);
			ctx.fill();
		}

		if (star.spike && shimmer > 0.26) {
			const arm = coreR * (2.8 + shimmer * 4.2);
			ctx.globalAlpha = alpha * (0.26 + shimmer * 0.48);
			ctx.strokeStyle = `rgba(${red}, ${green}, 255, 1)`;
			ctx.lineWidth = 0.55 + shimmer * 0.55;
			ctx.beginPath();
			ctx.moveTo(star.x - arm, star.y);
			ctx.lineTo(star.x + arm, star.y);
			ctx.moveTo(star.x, star.y - arm);
			ctx.lineTo(star.x, star.y + arm);
			ctx.stroke();

			if (shimmer > 0.5) {
				const diag = arm * 0.55;
				ctx.globalAlpha = alpha * 0.24 * shimmer;
				ctx.beginPath();
				ctx.moveTo(star.x - diag, star.y - diag);
				ctx.lineTo(star.x + diag, star.y + diag);
				ctx.moveTo(star.x - diag, star.y + diag);
				ctx.lineTo(star.x + diag, star.y - diag);
				ctx.stroke();
			}
		}
	}

	ctx.restore();
};

/**
 * Silver lettering engraved into the lantern belly —
 * mapped to the curved paper surface (cylinder + bulb contour).
 */
const drawLanternLabel = (
	ctx: CanvasRenderingContext2D,
	label: string,
	drawW: number,
	drawH: number,
) => {
	const maxTextW = drawW * LABEL_FIT;
	let fontSize = Math.min(drawW * 0.15, 23);
	ctx.font = `700 ${fontSize}px ${LABEL_FONT}`;
	while (fontSize > 11 && ctx.measureText(label).width > maxTextW) {
		fontSize -= 0.4;
		ctx.font = `700 ${fontSize}px ${LABEL_FONT}`;
	}

	const chars = label.split('');
	ctx.font = `700 ${fontSize}px ${LABEL_FONT}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	const widths = chars.map((ch) => ctx.measureText(ch).width);
	const total = widths.reduce((sum, w) => sum + w, 0);

	/*
	 * Tighter radius = text wraps with the lantern barrel.
	 * Horizontal radius ~ half body width so letters follow the paper curve.
	 */
	const radiusX = drawW * 0.52;
	const arc = Math.min(1.15, total / radiusX);
	const bellyY = drawH * 0.45;
	const bulbDrop = drawH * 0.028;
	const groove = Math.max(0.6, fontSize * 0.06);

	type SurfacePt = {
		x: number;
		y: number;
		angle: number;
		wrap: number;
		light: number;
	};

	const surfacePoints = (): SurfacePt[] => {
		const pts: SurfacePt[] = [];
		let angle = -arc / 2;
		for (let i = 0; i < chars.length; i++) {
			const w = widths[i];
			const mid = angle + w / (2 * radiusX);
			const cosA = Math.cos(mid);
			const sinA = Math.sin(mid);
			/* Foreshorten + fade as letter wraps off the facing side */
			const wrap = Math.max(0.42, Math.pow(Math.abs(cosA), 0.65));
			const light = 0.55 + cosA * 0.45;
			pts.push({
				x: drawW / 2 + sinA * radiusX,
				y: bellyY + (1 - cosA) * bulbDrop * 1.35,
				angle: mid,
				wrap,
				light,
			});
			angle += w / radiusX;
		}
		return pts;
	};

	const points = surfacePoints();

	/* Keep engraving inside the paper silhouette */
	ctx.save();
	ctx.beginPath();
	ctx.ellipse(
		drawW * 0.5,
		drawH * 0.48,
		drawW * 0.4,
		drawH * 0.36,
		0,
		0,
		Math.PI * 2,
	);
	ctx.clip();

	const paintOnSurface = (
		ox: number,
		oy: number,
		fillFor: (p: SurfacePt) => string,
		composite: GlobalCompositeOperation,
		blur = 0,
		shadowColor = 'transparent',
		extraRotate = 0,
	) => {
		ctx.save();
		ctx.globalCompositeOperation = composite;
		ctx.shadowColor = shadowColor;
		ctx.shadowBlur = blur;
		ctx.font = `700 ${fontSize}px ${LABEL_FONT}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		for (let i = 0; i < chars.length; i++) {
			const p = points[i];
			ctx.save();
			ctx.translate(p.x + ox, p.y + oy);
			/* Tangent to the barrel — letters lean with the paper */
			ctx.rotate(p.angle * 0.92 + extraRotate);
			/* Width compresses toward the sides like real wrap */
			ctx.scale(p.wrap, 0.9 + p.wrap * 0.08);
			ctx.globalAlpha = 0.55 + p.light * 0.45;
			ctx.fillStyle = fillFor(p);
			ctx.fillText(chars[i], 0, 0);
			ctx.restore();
		}
		ctx.restore();
	};

	/* Soft paper occlusion under the groove */
	paintOnSurface(
		groove * 0.9,
		groove * 1.25,
		() => 'rgba(18, 12, 8, 0.42)',
		'multiply',
		fontSize * 0.35,
		'rgba(10, 8, 6, 0.4)',
	);

	/* Recessed carve — dark ink into the fibers */
	paintOnSurface(
		groove * 0.55,
		groove * 0.75,
		(p) =>
			`rgba(${Math.round(22 + (1 - p.light) * 10)}, ${Math.round(28 + (1 - p.light) * 8)}, ${Math.round(36 + (1 - p.light) * 6)}, 0.55)`,
		'multiply',
		fontSize * 0.08,
	);

	/* Cool silver body following surface light */
	paintOnSurface(
		0,
		0,
		(p) => {
			const r = Math.round(175 + p.light * 55);
			const g = Math.round(190 + p.light * 45);
			const b = Math.round(210 + p.light * 40);
			return `rgba(${r}, ${g}, ${b}, ${0.78 + p.light * 0.18})`;
		},
		'source-over',
		fontSize * 0.2,
		'rgba(160, 200, 235, 0.45)',
	);

	/* Engraved highlight along the lit rim of each letter */
	paintOnSurface(
		-groove * 0.95,
		-groove * 1.05,
		(p) =>
			`rgba(245, 250, 255, ${0.28 + p.light * 0.5})`,
		'screen',
		fontSize * 0.12,
		'rgba(210, 235, 255, 0.55)',
	);

	/* Specular kiss on the facing center */
	paintOnSurface(
		-groove * 1.2,
		-groove * 1.35,
		(p) =>
			`rgba(255, 255, 255, ${0.12 + p.wrap * 0.28})`,
		'screen',
		0,
	);

	ctx.restore();
};

/** Soft paper warmth — no fire, just gentle lantern glow. */
const drawPaperWarmth = (
	ctx: CanvasRenderingContext2D,
	drawW: number,
	drawH: number,
) => {
	ctx.save();
	ctx.globalCompositeOperation = 'screen';
	const wash = ctx.createRadialGradient(
		drawW * 0.5,
		drawH * 0.55,
		drawW * 0.08,
		drawW * 0.5,
		drawH * 0.5,
		drawH * 0.48,
	);
	wash.addColorStop(0, 'rgba(255, 200, 120, 0.12)');
	wash.addColorStop(0.55, 'rgba(255, 150, 70, 0.05)');
	wash.addColorStop(1, 'rgba(255, 80, 20, 0)');
	ctx.fillStyle = wash;
	ctx.fillRect(0, drawH * 0.15, drawW, drawH * 0.75);
	ctx.restore();
};

/** Bake body + unique tint + readable paper label once. */
const bakeLanternSprite = (
	bodyImg: HTMLImageElement,
	label: string,
	hue: number,
	drawW: number,
	drawH: number,
) => {
	const pad = Math.ceil(Math.max(drawW, drawH) * 0.08);
	const sprite = document.createElement('canvas');
	sprite.width = Math.max(1, Math.round(drawW + pad * 2));
	sprite.height = Math.max(1, Math.round(drawH + pad * 2));
	const ctx = sprite.getContext('2d');
	if (!ctx) return sprite;

	ctx.translate(pad, pad);
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	const sat = hue === 165 ? 1.22 : 1.08;
	const bright = hue === 165 ? 1.08 : 1.02;
	ctx.filter = `hue-rotate(${hue}deg) saturate(${sat}) brightness(${bright})`;
	ctx.drawImage(bodyImg, 0, 0, drawW, drawH);
	ctx.filter = 'none';
	drawPaperWarmth(ctx, drawW, drawH);
	drawLanternLabel(ctx, label, drawW, drawH);
	return sprite;
};

type NightCloud = {
	x: number;
	y: number;
	w: number;
	h: number;
	alpha: number;
	speed: number;
	phase: number;
	puffs: { ox: number; oy: number; rx: number; ry: number }[];
};

type Firefly = {
	lanternIndex: number;
	orbitR: number;
	orbitPhase: number;
	orbitSpeed: number;
	bobPhase: number;
	bobSpeed: number;
	r: number;
	blinkPhase: number;
	blinkSpeed: number;
	warmth: number;
	homeOffsetX: number;
	homeOffsetY: number;
	ambient: boolean;
	x: number;
	y: number;
	homeX: number;
	homeY: number;
	ampX: number;
	ampY: number;
	driftSpeed: number;
	phase: number;
};

const createNightClouds = (width: number, height: number): NightCloud[] =>
	Array.from({ length: 8 }, (_, i) => {
		const w = rand(width * 0.32, width * 0.62);
		const h = rand(height * 0.1, height * 0.2);
		const puffCount = 5 + Math.floor(Math.random() * 4);
		return {
			x: rand(-w * 0.2, width * 0.85),
			y: height * (0.06 + i * 0.09) + rand(-height * 0.03, height * 0.03),
			w,
			h,
			alpha: rand(0.055, 0.12),
			speed: rand(0.01, 0.032) * (Math.random() > 0.5 ? 1 : -1),
			phase: rand(0, Math.PI * 2),
			puffs: Array.from({ length: puffCount }, () => ({
				ox: rand(-0.38, 0.38),
				oy: rand(-0.38, 0.38),
				rx: rand(0.24, 0.44),
				ry: rand(0.3, 0.58),
			})),
		};
	});

const drawNightClouds = (
	ctx: CanvasRenderingContext2D,
	clouds: NightCloud[],
	time: number,
	width: number,
	reducedMotion: boolean,
) => {
	const t = time * 0.001;
	ctx.save();

	for (const cloud of clouds) {
		if (!reducedMotion) {
			cloud.x += cloud.speed;
			if (cloud.x > width + cloud.w * 0.35) cloud.x = -cloud.w * 0.4;
			if (cloud.x < -cloud.w * 0.45) cloud.x = width + cloud.w * 0.25;
		}

		const breathe = 1 + Math.sin(t * 0.12 + cloud.phase) * 0.04;
		const cx = cloud.x + cloud.w * 0.5;
		const cy = cloud.y + Math.sin(t * 0.08 + cloud.phase) * 4;

		for (const puff of cloud.puffs) {
			const px = cx + puff.ox * cloud.w;
			const py = cy + puff.oy * cloud.h;
			const rx = puff.rx * cloud.w * breathe;
			const ry = puff.ry * cloud.h * breathe;

			/* Soft dark veil that gently mutes stars behind it */
			ctx.globalCompositeOperation = 'source-over';
			ctx.globalAlpha = cloud.alpha * 1.35;
			const shade = ctx.createRadialGradient(
				px,
				py,
				0,
				px,
				py,
				Math.max(rx, ry),
			);
			shade.addColorStop(0, 'rgba(8, 14, 26, 0.55)');
			shade.addColorStop(0.5, 'rgba(10, 18, 32, 0.22)');
			shade.addColorStop(1, 'rgba(6, 10, 20, 0)');
			ctx.fillStyle = shade;
			ctx.beginPath();
			ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
			ctx.fill();

			/* Cool moonlight kiss on the cloud rim */
			ctx.globalCompositeOperation = 'screen';
			ctx.globalAlpha = cloud.alpha * 0.9;
			const lit = ctx.createRadialGradient(
				px - rx * 0.15,
				py - ry * 0.2,
				0,
				px,
				py,
				Math.max(rx, ry),
			);
			lit.addColorStop(0, 'rgba(150, 175, 210, 0.28)');
			lit.addColorStop(0.4, 'rgba(90, 120, 160, 0.1)');
			lit.addColorStop(1, 'rgba(40, 60, 90, 0)');
			ctx.fillStyle = lit;
			ctx.beginPath();
			ctx.ellipse(px, py, rx * 0.95, ry * 0.95, 0, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	ctx.restore();
};

const createFireflyGlow = () => {
	const sprite = document.createElement('canvas');
	sprite.width = 64;
	sprite.height = 64;
	const gctx = sprite.getContext('2d');
	if (gctx) {
		const glow = gctx.createRadialGradient(32, 32, 0, 32, 32, 32);
		glow.addColorStop(0, 'rgba(255, 255, 220, 1)');
		glow.addColorStop(0.18, 'rgba(255, 245, 150, 0.95)');
		glow.addColorStop(0.4, 'rgba(210, 255, 110, 0.45)');
		glow.addColorStop(0.68, 'rgba(140, 230, 90, 0.12)');
		glow.addColorStop(1, 'rgba(80, 180, 60, 0)');
		gctx.fillStyle = glow;
		gctx.fillRect(0, 0, 64, 64);
	}
	return sprite;
};

const createAmbientFireflies = (width: number, height: number): Firefly[] =>
	Array.from({ length: AMBIENT_FIREFLY_COUNT }, () => {
		const homeX = rand(width * 0.04, width * 0.96);
		const homeY = rand(height * 0.12, height * 0.88);
		return {
			lanternIndex: -1,
			orbitR: 0,
			orbitPhase: 0,
			orbitSpeed: 0,
			bobPhase: rand(0, Math.PI * 2),
			bobSpeed: rand(0.4, 1.1),
			r: rand(0.55, 1.25),
			blinkPhase: rand(0, Math.PI * 2),
			blinkSpeed: rand(0.7, 1.6),
			warmth: rand(0.2, 0.9),
			homeOffsetX: 0,
			homeOffsetY: 0,
			ambient: true,
			x: homeX,
			y: homeY,
			homeX,
			homeY,
			ampX: rand(18, 48),
			ampY: rand(12, 36),
			driftSpeed: rand(0.18, 0.42),
			phase: rand(0, Math.PI * 2),
		};
	});

const createLanternFireflies = (lanternCount: number): Firefly[] => {
	const flies: Firefly[] = [];
	for (let i = 0; i < lanternCount; i += 1) {
		for (let n = 0; n < FIREFLIES_PER_LANTERN; n += 1) {
			flies.push({
				lanternIndex: i,
				orbitR: rand(18, 78),
				orbitPhase: rand(0, Math.PI * 2),
				orbitSpeed: rand(0.35, 0.95) * (Math.random() > 0.5 ? 1 : -1),
				bobPhase: rand(0, Math.PI * 2),
				bobSpeed: rand(0.55, 1.4),
				r: rand(0.7, 1.55),
				blinkPhase: rand(0, Math.PI * 2),
				blinkSpeed: rand(0.85, 1.9),
				warmth: rand(0.25, 1),
				homeOffsetX: rand(-12, 12),
				homeOffsetY: rand(-8, 22),
				ambient: false,
				x: 0,
				y: 0,
				homeX: 0,
				homeY: 0,
				ampX: 0,
				ampY: 0,
				driftSpeed: 0,
				phase: rand(0, Math.PI * 2),
			});
		}
	}
	return flies;
};

/**
 * Natural fireflies — brighter lime-gold blink, lazy flight around lanterns.
 */
const drawFireflies = (
	ctx: CanvasRenderingContext2D,
	flies: Firefly[],
	glow: HTMLCanvasElement,
	time: number,
	reducedMotion: boolean,
	lanterns: FlyingLantern[],
) => {
	const t = time * 0.001;
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';

	for (const fly of flies) {
		if (fly.ambient) {
			if (!reducedMotion) {
				fly.x =
					fly.homeX +
					Math.sin(t * fly.driftSpeed + fly.phase) * fly.ampX +
					Math.sin(t * fly.driftSpeed * 0.37 + fly.phase * 1.7) *
						fly.ampX *
						0.28;
				fly.y =
					fly.homeY +
					Math.cos(t * fly.driftSpeed * 0.82 + fly.phase) * fly.ampY +
					Math.sin(t * fly.driftSpeed * 1.1 + fly.phase * 0.6) *
						fly.ampY *
						0.22;
			}
		} else {
			const lantern = lanterns[fly.lanternIndex];
			if (!lantern) continue;
			const bob =
				Math.sin(time * 0.0016 + lantern.phase) * lantern.drawH * 0.012;
			const cx = lantern.x + fly.homeOffsetX;
			const cy = lantern.y + bob + fly.homeOffsetY;
			if (!reducedMotion) {
				fly.orbitPhase += fly.orbitSpeed * 0.012;
			}
			const wobble =
				Math.sin(t * fly.bobSpeed + fly.bobPhase) * fly.orbitR * 0.18;
			fly.x =
				cx +
				Math.cos(fly.orbitPhase) * (fly.orbitR + wobble) *
					0.85;
			fly.y =
				cy +
				Math.sin(fly.orbitPhase * 0.92 + fly.phase) *
					(fly.orbitR * 0.55 + wobble * 0.4) -
				Math.sin(t * fly.bobSpeed + fly.bobPhase) * 6;
		}

		const pulse =
			0.5 + 0.5 * Math.sin(t * fly.blinkSpeed + fly.blinkPhase);
		const glowOn = Math.pow(Math.max(0, pulse), 2.4);
		const alpha = fly.ambient
			? 0.12 + glowOn * 0.72
			: 0.22 + glowOn * 0.95;
		if (alpha < 0.14) continue;

		const warm = fly.warmth;
		const size = fly.r * (1.35 + glowOn * (fly.ambient ? 1.5 : 2.1));

		ctx.globalAlpha = alpha * (fly.ambient ? 0.45 : 0.7);
		ctx.drawImage(
			glow,
			fly.x - size * 2.2,
			fly.y - size * 2.2,
			size * 4.4,
			size * 4.4,
		);

		ctx.globalAlpha = alpha;
		const core = ctx.createRadialGradient(
			fly.x,
			fly.y,
			0,
			fly.x,
			fly.y,
			size,
		);
		core.addColorStop(
			0,
			`rgba(255, 255, ${Math.round(220 + warm * 30)}, 1)`,
		);
		core.addColorStop(
			0.35,
			`rgba(${Math.round(230 + warm * 25)}, ${Math.round(255 - warm * 30)}, ${Math.round(120 + warm * 40)}, 0.95)`,
		);
		core.addColorStop(
			1,
			`rgba(${Math.round(150 + warm * 40)}, 230, 90, 0)`,
		);
		ctx.fillStyle = core;
		ctx.beginPath();
		ctx.arc(fly.x, fly.y, size, 0, Math.PI * 2);
		ctx.fill();
	}

	ctx.restore();
};

export const ExpertiseSkyBg = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d', {
			alpha: true,
			desynchronized: true,
		});
		if (!ctx) return;

		const reducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;

		let width = window.innerWidth;
		let height = window.innerHeight;
		let bodyImg: HTMLImageElement | null = null;
		let lanterns: FlyingLantern[] = [];
		let stars = createStars(width, height);
		let clouds = createNightClouds(width, height);
		let ambientFireflies = createAmbientFireflies(width, height);
		let lanternFireflies: Firefly[] = [];
		const fireflyGlow = createFireflyGlow();
		let animationId = 0;
		let lastPaint = 0;
		let lastFrameTime = performance.now();
		let ready = false;
		let drag: LanternDrag | null = null;
		let hoverLantern: FlyingLantern | null = null;

		const measureCtx = document.createElement('canvas').getContext('2d');

		const visualCenter = (lantern: FlyingLantern, time: number) => {
			const bob =
				Math.sin(time * 0.0016 + lantern.phase) * lantern.drawH * 0.012;
			return { x: lantern.x, y: lantern.y + bob };
		};

		const hitLanternAt = (x: number, y: number, time: number) => {
			for (let i = lanterns.length - 1; i >= 0; i -= 1) {
				const lantern = lanterns[i];
				const center = visualCenter(lantern, time);
				const halfW = lantern.drawW * 0.32;
				const halfH = lantern.drawH * 0.38;
				if (
					x >= center.x - halfW &&
					x <= center.x + halfW &&
					y >= center.y - halfH &&
					y <= center.y + halfH
				) {
					return lantern;
				}
			}
			return null;
		};

		const setGrabCursor = (mode: 'none' | 'grab' | 'grabbing') => {
			document.body.classList.toggle('lantern-grab', mode === 'grab');
			document.body.classList.toggle(
				'lantern-grabbing',
				mode === 'grabbing',
			);
		};

		const sizeFor = (
			label: string,
			isAi: boolean,
			z: number,
			sizeBias: number,
			sizeMul: number,
			nativeW: number,
			nativeH: number,
		) => {
			const view = Math.min(width, height);
			const fontSize = preferredFontSize(label, view, isAi);
			if (measureCtx) {
				measureCtx.font = `700 ${fontSize}px ${LABEL_FONT}`;
			}
			const textW = measureCtx
				? measureCtx.measureText(label).width
				: label.length * fontSize * 0.55;
			const neededW = textW / LABEL_FIT;
			const baseH =
				(isAi ? view * 0.12 : view * (0.078 + sizeBias * 0.02)) *
				z *
				sizeMul;
			const baseScale = baseH / Math.max(1, nativeH);
			const baseW = nativeW * baseScale;
			const drawW = Math.max(baseW, neededW);
			const maxW = view * (isAi ? 0.26 : 0.22);
			const finalW = Math.min(drawW, maxW);
			return {
				drawW: finalW,
				drawH: finalW * (nativeH / Math.max(1, nativeW)),
			};
		};

		const rebuildSprites = () => {
			if (!bodyImg) return;
			const nativeW = bodyImg.naturalWidth || 320;
			const nativeH = bodyImg.naturalHeight || 420;
			for (const lantern of lanterns) {
				const def = LANTERN_DEFS.find((d) => d.label === lantern.label);
				const sizeMul = def?.sizeMul ?? 1;
				const size = sizeFor(
					lantern.label,
					lantern.isAi,
					lantern.z,
					lantern.sizeBias,
					sizeMul,
					nativeW,
					nativeH,
				);
				lantern.drawW = size.drawW;
				lantern.drawH = size.drawH;
				lantern.sprite = bakeLanternSprite(
					bodyImg,
					lantern.label,
					lantern.hue,
					size.drawW,
					size.drawH,
				);
			}
		};

		const spawn = () => {
			if (!bodyImg) return;
			const nativeW = bodyImg.naturalWidth || 320;
			const nativeH = bodyImg.naturalHeight || 420;
			lanterns = LANTERN_DEFS.map((def, index) => {
				const z = def.isAi ? 1.18 : 0.82 + index * 0.06;
				const sizeBias = index / Math.max(1, LANTERN_DEFS.length - 1);
				const size = sizeFor(
					def.label,
					def.isAi,
					z,
					sizeBias,
					def.sizeMul,
					nativeW,
					nativeH,
				);
				return {
					label: def.label,
					isAi: def.isAi,
					hue: def.hue,
					x: width * def.slot + rand(-width * 0.03, width * 0.03),
					y: def.isAi
						? height * 0.4
						: height * (0.22 + index * 0.14) + rand(-30, 40),
					vx: rand(0.06, 0.14) + index * 0.008,
					vy: rand(-0.16, -0.07) - index * 0.006,
					drawW: size.drawW,
					drawH: size.drawH,
					sizeBias,
					phase: rand(0, Math.PI * 2) + index,
					driftAmp: 0.55 + index * 0.12,
					driftFreq: 0.00018 + index * 0.00003,
					swayAmp: 0.012 + index * 0.002,
					z,
					windPhase: rand(0, Math.PI * 2),
					windFreq: 0.00012 + index * 0.00002,
					liftPhase: rand(0, Math.PI * 2),
					sprite: bakeLanternSprite(
						bodyImg!,
						def.label,
						def.hue,
						size.drawW,
						size.drawH,
					),
				};
			});
			lanterns.sort((a, b) => a.z - b.z);
			lanternFireflies = createLanternFireflies(lanterns.length);
		};

		const resize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			/* dpr 1 keeps cursor responsive on this heavy page */
			canvas.width = width;
			canvas.height = height;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			stars = createStars(width, height);
			clouds = createNightClouds(width, height);
			ambientFireflies = createAmbientFireflies(width, height);
			if (ready && bodyImg && lanterns.length) {
				rebuildSprites();
				lanternFireflies = createLanternFireflies(lanterns.length);
			}
		};

		const paint = (time: number) => {
			const dt = Math.min(2.2, (time - lastFrameTime) / (1000 / 60));
			lastFrameTime = time;

			ctx.clearRect(0, 0, width, height);
			drawSkyStars(ctx, stars, time);
			drawNightClouds(ctx, clouds, time, width, reducedMotion);

			if (!bodyImg || !lanterns.length) {
				drawFireflies(
					ctx,
					ambientFireflies,
					fireflyGlow,
					time,
					reducedMotion,
					lanterns,
				);
				ctx.globalAlpha = 1;
				return;
			}

			const frameBoost = reducedMotion ? 0 : dt;
			const dragged = drag?.lantern ?? null;

			if (drag && dragged) {
				const ease = 1 - Math.pow(0.78, dt);
				dragged.x += (drag.targetX - dragged.x) * ease;
				dragged.y += (drag.targetY - dragged.y) * ease;
				dragged.phase += 0.006 * dt;
			}

			const drawOrder =
				dragged && lanterns.includes(dragged)
					? [
							...lanterns.filter((item) => item !== dragged),
							dragged,
						]
					: lanterns;

			for (const lantern of drawOrder) {
				const { drawW, drawH, sprite } = lantern;
				const isDragged = dragged === lantern;

				if (!reducedMotion && !isDragged) {
					lantern.phase += 0.008 * dt;
					lantern.windPhase += lantern.windFreq * 60 * dt;
					lantern.liftPhase += lantern.driftFreq * 48 * dt;

					const wind =
						Math.sin(lantern.windPhase) * 0.45 +
						Math.sin(lantern.windPhase * 0.37 + lantern.phase) *
							0.25;
					const lift =
						Math.sin(lantern.liftPhase + lantern.phase) * 0.35 +
						Math.cos(lantern.liftPhase * 0.7) * 0.2;
					const pathX =
						Math.sin(time * lantern.driftFreq + lantern.phase) *
						lantern.driftAmp;
					const pathY =
						Math.cos(
							time * lantern.driftFreq * 0.78 + lantern.phase,
						) * 0.55;

					lantern.vx +=
						(0.1 + wind * 0.05 + pathX * 0.012 - lantern.vx) *
						0.02 *
						dt;
					lantern.vy +=
						(-0.12 + lift * 0.04 + pathY * 0.02 - lantern.vy) *
						0.02 *
						dt;

					lantern.vx = Math.max(
						0.04,
						Math.min(0.22, lantern.vx),
					);
					lantern.vy = Math.max(
						-0.22,
						Math.min(-0.04, lantern.vy),
					);

					lantern.x += lantern.vx * frameBoost;
					lantern.y += lantern.vy * frameBoost;

					if (lantern.y < -drawH) {
						lantern.y = height + drawH * 0.35;
						lantern.x = lantern.isAi
							? width * 0.18 + rand(0, width * 0.25)
							: rand(-drawW * 0.2, width * 0.45);
						lantern.vx = rand(0.07, 0.16);
						lantern.vy = rand(-0.16, -0.07);
					}
					if (lantern.x > width + drawW) {
						lantern.x = -drawW * 0.3;
						lantern.y = rand(height * 0.22, height * 0.95);
					}
				}

				if (isDragged) {
					const pad = Math.max(drawW, drawH) * 0.2;
					lantern.x = Math.max(
						-pad,
						Math.min(width + pad, lantern.x),
					);
					lantern.y = Math.max(
						-pad,
						Math.min(height + pad, lantern.y),
					);
				}

				const bob = isDragged
					? Math.sin(time * 0.001 + lantern.phase) * drawH * 0.005
					: Math.sin(time * 0.0011 + lantern.phase) * drawH * 0.016 +
						Math.sin(time * 0.00055 + lantern.liftPhase) *
							drawH *
							0.008;
				const sway =
					(Math.sin(time * 0.00075 + lantern.phase * 1.1) *
						lantern.swayAmp +
						Math.sin(time * 0.0004 + lantern.windPhase) *
							lantern.swayAmp *
							0.45) *
					(isDragged ? 0.4 : 1);
				const cx = lantern.x;
				const cy = lantern.y + bob;

				/* Soft warm halo so each lantern reads in the night */
				ctx.save();
				ctx.globalCompositeOperation = 'screen';
				const halo = ctx.createRadialGradient(
					cx,
					cy + drawH * 0.08,
					drawW * 0.08,
					cx,
					cy + drawH * 0.05,
					drawW * 0.72,
				);
				halo.addColorStop(0, 'rgba(255, 210, 130, 0.22)');
				halo.addColorStop(0.45, 'rgba(255, 160, 80, 0.08)');
				halo.addColorStop(1, 'rgba(255, 100, 40, 0)');
				ctx.fillStyle = halo;
				ctx.beginPath();
				ctx.ellipse(
					cx,
					cy + drawH * 0.05,
					drawW * 0.7,
					drawH * 0.55,
					0,
					0,
					Math.PI * 2,
				);
				ctx.fill();
				ctx.restore();

				ctx.save();
				ctx.translate(cx, cy);
				ctx.rotate(sway);
				ctx.globalAlpha = 0.9 + lantern.z * 0.1;
				ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
				ctx.restore();
			}

			drawFireflies(
				ctx,
				lanternFireflies,
				fireflyGlow,
				time,
				reducedMotion,
				lanterns,
			);
			drawFireflies(
				ctx,
				ambientFireflies,
				fireflyGlow,
				time,
				reducedMotion,
				lanterns,
			);
			ctx.globalAlpha = 1;
		};

		const render = (time: number) => {
			const interval = drag ? 1000 / 60 : PAINT_MS;
			if (ready && time - lastPaint >= interval) {
				lastPaint = time;
				paint(time);
			}
			animationId = requestAnimationFrame(render);
		};

		const onPointerDown = (event: PointerEvent) => {
			if (event.button !== 0 || reducedMotion) return;
			if (isLanternBlockedTarget(event.target)) return;
			if (!lanterns.length) return;

			const hit = hitLanternAt(
				event.clientX,
				event.clientY,
				performance.now(),
			);
			if (!hit) return;

			event.preventDefault();
			drag = {
				lantern: hit,
				offsetX: event.clientX - hit.x,
				offsetY: event.clientY - hit.y,
				pointerId: event.pointerId,
				lastX: event.clientX,
				lastY: event.clientY,
				lastT: performance.now(),
				velX: 0,
				velY: 0,
				targetX: hit.x,
				targetY: hit.y,
			};
			hoverLantern = hit;
			setGrabCursor('grabbing');
			lastPaint = 0;
		};

		const onPointerMove = (event: PointerEvent) => {
			if (drag && event.pointerId === drag.pointerId) {
				event.preventDefault();
				const now = performance.now();
				const dt = Math.max(1, now - drag.lastT);
				const rawVx = ((event.clientX - drag.lastX) / dt) * 16.67;
				const rawVy = ((event.clientY - drag.lastY) / dt) * 16.67;
				drag.velX = drag.velX * 0.65 + rawVx * 0.35;
				drag.velY = drag.velY * 0.65 + rawVy * 0.35;
				drag.lastX = event.clientX;
				drag.lastY = event.clientY;
				drag.lastT = now;
				drag.targetX = event.clientX - drag.offsetX;
				drag.targetY = event.clientY - drag.offsetY;
				return;
			}

			if (reducedMotion || !lanterns.length) {
				if (hoverLantern) {
					hoverLantern = null;
					setGrabCursor('none');
				}
				return;
			}

			if (isLanternBlockedTarget(event.target)) {
				if (hoverLantern) {
					hoverLantern = null;
					setGrabCursor('none');
				}
				return;
			}

			const hit = hitLanternAt(
				event.clientX,
				event.clientY,
				performance.now(),
			);
			if (hit !== hoverLantern) {
				hoverLantern = hit;
				setGrabCursor(hit ? 'grab' : 'none');
			}
		};

		const endDrag = (event: PointerEvent) => {
			if (!drag || event.pointerId !== drag.pointerId) return;
			const lantern = drag.lantern;
			const tossX = Math.max(-0.45, Math.min(0.45, drag.velX * 0.045));
			const tossY = Math.max(-0.45, Math.min(0.2, drag.velY * 0.045));
			lantern.vx = Math.max(
				0.04,
				Math.min(0.22, lantern.vx * 0.35 + Math.abs(tossX) * 0.4 + 0.06),
			);
			lantern.vy = Math.max(
				-0.22,
				Math.min(-0.04, lantern.vy * 0.4 + tossY - 0.04),
			);
			drag = null;
			const stillOver =
				!isLanternBlockedTarget(event.target) &&
				hitLanternAt(event.clientX, event.clientY, performance.now()) ===
					lantern;
			hoverLantern = stillOver ? lantern : null;
			setGrabCursor(stillOver ? 'grab' : 'none');
		};

		let cancelled = false;

		/* Paint sky immediately; lanterns join as soon as the body is ready */
		resize();
		ready = true;
		paint(performance.now());
		animationId = requestAnimationFrame(render);

		const start = async () => {
			try {
				const body = cachedBodyImg ?? (await bodyImgReady);
				if (cancelled || !body) return;
				bodyImg = body;
				spawn();
				lastPaint = 0;
				paint(performance.now());

				if (document.fonts?.load) {
					void document.fonts
						.load(`700 32px ${LABEL_FONT}`)
						.then(() => {
							if (cancelled || !bodyImg || !lanterns.length) {
								return;
							}
							rebuildSprites();
							paint(performance.now());
						});
				}
			} catch {
				/* sky still runs without lanterns */
			}
		};
		void start();

		window.addEventListener('resize', resize);
		window.addEventListener('pointerdown', onPointerDown, {
			capture: true,
		});
		window.addEventListener('pointermove', onPointerMove, {
			capture: true,
			passive: false,
		});
		window.addEventListener('pointerup', endDrag, { capture: true });
		window.addEventListener('pointercancel', endDrag, { capture: true });

		return () => {
			cancelled = true;
			window.removeEventListener('resize', resize);
			window.removeEventListener('pointerdown', onPointerDown, true);
			window.removeEventListener('pointermove', onPointerMove, true);
			window.removeEventListener('pointerup', endDrag, true);
			window.removeEventListener('pointercancel', endDrag, true);
			setGrabCursor('none');
			cancelAnimationFrame(animationId);
		};
	}, []);

	return (
		<div
			className='expertise-sky'
			aria-hidden='true'
		>
			<canvas
				ref={canvasRef}
				className='expertise-sky-lanterns'
			/>
			<span className='expertise-sky-veil' />
		</div>
	);
};
