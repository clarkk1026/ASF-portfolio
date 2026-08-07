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
	sprite: HTMLCanvasElement;
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
const STAR_COUNT = 36;
const PAINT_MS = 1000 / 36;

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
const createStars = (width: number, height: number): SkyStar[] =>
	Array.from({ length: STAR_COUNT }, () => {
		const bright = Math.random() > 0.82;
		const mid = !bright && Math.random() > 0.5;
		return {
			x: Math.random() * width,
			y: Math.random() ** 1.12 * height * 0.78,
			r: bright
				? rand(0.7, 1.25)
				: mid
					? rand(0.4, 0.75)
					: rand(0.2, 0.48),
			base: bright
				? rand(0.48, 0.8)
				: mid
					? rand(0.3, 0.55)
					: rand(0.18, 0.4),
			speed: bright ? rand(2.4, 5.0) : rand(1.5, 3.8),
			phase: rand(0, Math.PI * 2),
			temperature: rand(0.08, 0.65),
			spike: bright,
		};
	});

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

type Firefly = {
	x: number;
	y: number;
	homeX: number;
	homeY: number;
	r: number;
	phase: number;
	blinkPhase: number;
	blinkSpeed: number;
	driftSpeed: number;
	ampX: number;
	ampY: number;
	warmth: number;
};

const FIREFLY_COUNT = 64;

const createFireflyGlow = () => {
	const sprite = document.createElement('canvas');
	sprite.width = 48;
	sprite.height = 48;
	const gctx = sprite.getContext('2d');
	if (gctx) {
		const glow = gctx.createRadialGradient(24, 24, 0, 24, 24, 24);
		glow.addColorStop(0, 'rgba(255, 255, 230, 1)');
		glow.addColorStop(0.2, 'rgba(255, 240, 150, 0.75)');
		glow.addColorStop(0.45, 'rgba(190, 255, 120, 0.28)');
		glow.addColorStop(0.72, 'rgba(120, 220, 90, 0.06)');
		glow.addColorStop(1, 'rgba(80, 180, 60, 0)');
		gctx.fillStyle = glow;
		gctx.fillRect(0, 0, 48, 48);
	}
	return sprite;
};

const createFireflies = (width: number, height: number): Firefly[] =>
	Array.from({ length: FIREFLY_COUNT }, () => {
		const homeX = rand(width * 0.04, width * 0.96);
		const homeY = rand(height * 0.1, height * 0.9);
		return {
			x: homeX,
			y: homeY,
			homeX,
			homeY,
			r: rand(0.45, 1.15),
			phase: rand(0, Math.PI * 2),
			blinkPhase: rand(0, Math.PI * 2),
			blinkSpeed: rand(0.55, 1.45),
			driftSpeed: rand(0.2, 0.5),
			ampX: rand(14, 42),
			ampY: rand(10, 32),
			warmth: rand(0.15, 0.85),
		};
	});

/**
 * Natural fireflies — tiny cute lime-gold blink, lazy wandering flight.
 */
const drawFireflies = (
	ctx: CanvasRenderingContext2D,
	flies: Firefly[],
	glow: HTMLCanvasElement,
	time: number,
	reducedMotion: boolean,
) => {
	const t = time * 0.001;
	ctx.save();
	ctx.globalCompositeOperation = 'screen';

	for (const fly of flies) {
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

		const pulse = 0.5 + 0.5 * Math.sin(t * fly.blinkSpeed + fly.blinkPhase);
		const glowOn = Math.pow(pulse, 3.2);
		const alpha = 0.06 + glowOn * 0.9;
		if (alpha < 0.1) continue;

		const warm = fly.warmth;
		const size = fly.r * (1.15 + glowOn * 1.35);

		ctx.globalAlpha = alpha * 0.4;
		ctx.drawImage(
			glow,
			fly.x - size * 1.6,
			fly.y - size * 1.6,
			size * 3.2,
			size * 3.2,
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
			`rgba(255, 255, ${Math.round(210 + warm * 40)}, 1)`,
		);
		core.addColorStop(
			0.4,
			`rgba(${Math.round(220 + warm * 30)}, ${Math.round(255 - warm * 40)}, ${Math.round(110 + warm * 40)}, 0.8)`,
		);
		core.addColorStop(
			1,
			`rgba(${Math.round(140 + warm * 40)}, 220, 80, 0)`,
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
		let fireflies = createFireflies(width, height);
		const fireflyGlow = createFireflyGlow();
		let animationId = 0;
		let lastPaint = 0;
		let ready = false;

		const measureCtx = document.createElement('canvas').getContext('2d');

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
					vx: rand(0.1, 0.22) + index * 0.015,
					vy: rand(-0.26, -0.12) - index * 0.01,
					drawW: size.drawW,
					drawH: size.drawH,
					sizeBias,
					phase: rand(0, Math.PI * 2) + index,
					driftAmp: 0.35 + index * 0.1,
					driftFreq: 0.00032 + index * 0.00005,
					swayAmp: 0.01 + index * 0.0025,
					z,
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
			fireflies = createFireflies(width, height);
			if (ready && bodyImg && lanterns.length) {
				rebuildSprites();
			}
		};

		const paint = (time: number) => {
			ctx.clearRect(0, 0, width, height);
			drawSkyStars(ctx, stars, time);

			if (!bodyImg || !lanterns.length) {
				drawFireflies(ctx, fireflies, fireflyGlow, time, reducedMotion);
				ctx.globalAlpha = 1;
				return;
			}

			const frameBoost = reducedMotion ? 0 : 1;

			for (const lantern of lanterns) {
				const { drawW, drawH, sprite } = lantern;

				if (!reducedMotion) {
					lantern.phase += 0.014;
					const pathX =
						Math.sin(time * lantern.driftFreq + lantern.phase) *
						lantern.driftAmp *
						0.55;
					const pathY =
						Math.cos(
							time * lantern.driftFreq * 0.85 + lantern.phase,
						) * 0.1;
					lantern.x += (lantern.vx + pathX * 0.08) * frameBoost;
					lantern.y += (lantern.vy + pathY) * frameBoost;

					if (Math.random() < 0.01) {
						lantern.vx += rand(-0.03, 0.04);
						lantern.vy += rand(-0.025, 0.02);
					}
					lantern.vx = Math.max(0.08, Math.min(0.38, lantern.vx * 0.9988));
					lantern.vy = Math.max(-0.36, Math.min(-0.08, lantern.vy * 0.9992));

					if (lantern.y < -drawH) {
						lantern.y = height + drawH * 0.35;
						lantern.x = lantern.isAi
							? width * 0.18 + rand(0, width * 0.25)
							: rand(-drawW * 0.2, width * 0.45);
						lantern.vx = rand(0.12, 0.28);
						lantern.vy = rand(-0.28, -0.12);
					}
					if (lantern.x > width + drawW) {
						lantern.x = -drawW * 0.3;
						lantern.y = rand(height * 0.22, height * 0.95);
					}
				}

				const bob =
					Math.sin(time * 0.0016 + lantern.phase) * drawH * 0.012;
				const sway =
					Math.sin(time * 0.001 + lantern.phase * 1.25) *
					lantern.swayAmp;
				const cx = lantern.x;
				const cy = lantern.y + bob;

				ctx.save();
				ctx.translate(cx, cy);
				ctx.rotate(sway);
				ctx.globalAlpha = 0.9 + lantern.z * 0.1;
				ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
				ctx.restore();
			}

			drawFireflies(ctx, fireflies, fireflyGlow, time, reducedMotion);
			ctx.globalAlpha = 1;
		};

		const render = (time: number) => {
			if (ready && time - lastPaint >= PAINT_MS) {
				lastPaint = time;
				paint(time);
			}
			animationId = requestAnimationFrame(render);
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

		return () => {
			cancelled = true;
			window.removeEventListener('resize', resize);
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
