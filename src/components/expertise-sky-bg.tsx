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
const LABEL_FIT = 0.68;
const STAR_COUNT = 60;
const PAINT_MS = 1000 / 30;

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
	const base = isAi ? view * 0.02 : view * 0.017;
	if (len <= 5) return Math.max(12, Math.min(22, base * 1.15));
	if (len <= 9) return Math.max(11, Math.min(19, base));
	return Math.max(10, Math.min(16, base * 0.85));
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

/** Sparse stars with realistic shine / twinkle. */
const createStars = (width: number, height: number): SkyStar[] =>
	Array.from({ length: STAR_COUNT }, () => {
		const bright = Math.random() > 0.78;
		return {
			x: Math.random() * width,
			y: Math.random() * height * 0.9,
			r: bright ? rand(0.75, 1.35) : rand(0.3, 0.85),
			base: bright ? rand(0.55, 0.92) : rand(0.28, 0.58),
			speed: rand(0.7, 2.4),
			phase: rand(0, Math.PI * 2),
			temperature: rand(0.1, 0.85),
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
				(0.65 + 0.35 * Math.sin(t * star.speed * 1.7 + star.phase * 0.6));
		const shimmer = Math.pow(wave, 6);
		const pulse = Math.pow(wave, 2.2);
		const alpha = Math.min(
			1,
			star.base * (0.45 + pulse * 0.55) + shimmer * 0.55,
		);
		const red = Math.round(220 + star.temperature * 35);
		const green = Math.round(232 + star.temperature * 18);
		const coreR = star.r * (0.85 + shimmer * 0.45);

		/* Soft atmospheric bloom */
		const glowR = coreR * (3.2 + shimmer * 3.5);
		ctx.globalAlpha = alpha * (0.22 + shimmer * 0.35);
		ctx.drawImage(
			starGlowSprite,
			star.x - glowR,
			star.y - glowR,
			glowR * 2,
			glowR * 2,
		);

		/* Bright core */
		ctx.globalAlpha = alpha;
		ctx.fillStyle = `rgba(${red}, ${green}, 255, 1)`;
		ctx.beginPath();
		ctx.arc(star.x, star.y, coreR, 0, Math.PI * 2);
		ctx.fill();

		/* Hot white center on bright stars */
		if (star.spike || shimmer > 0.55) {
			ctx.globalAlpha = alpha * (0.55 + shimmer * 0.4);
			ctx.fillStyle = 'rgba(255, 255, 255, 1)';
			ctx.beginPath();
			ctx.arc(star.x, star.y, coreR * 0.4, 0, Math.PI * 2);
			ctx.fill();
		}

		/* Diffraction spikes when shining */
		if (star.spike && shimmer > 0.35) {
			const arm = coreR * (2.8 + shimmer * 4.2);
			ctx.globalAlpha = alpha * (0.25 + shimmer * 0.45);
			ctx.strokeStyle = `rgba(${red}, ${green}, 255, 1)`;
			ctx.lineWidth = 0.55 + shimmer * 0.55;
			ctx.beginPath();
			ctx.moveTo(star.x - arm, star.y);
			ctx.lineTo(star.x + arm, star.y);
			ctx.moveTo(star.x, star.y - arm);
			ctx.lineTo(star.x, star.y + arm);
			ctx.stroke();

			if (shimmer > 0.7) {
				const diag = arm * 0.55;
				ctx.globalAlpha = alpha * 0.2 * shimmer;
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

/** Engraved soft silver lettering (baked once into sprite). */
const drawLanternLabel = (
	ctx: CanvasRenderingContext2D,
	label: string,
	drawW: number,
	drawH: number,
) => {
	const maxTextW = drawW * LABEL_FIT;
	let fontSize = Math.min(drawW * 0.145, 22);
	ctx.font = `700 ${fontSize}px ${LABEL_FONT}`;
	while (fontSize > 9 && ctx.measureText(label).width > maxTextW) {
		fontSize -= 0.5;
		ctx.font = `700 ${fontSize}px ${LABEL_FONT}`;
	}

	const groove = Math.max(0.55, fontSize * 0.05);
	ctx.save();
	ctx.translate(drawW / 2, drawH / 2 - drawH * 0.02);
	ctx.transform(1.04, 0, 0, 0.9, 0, 0);
	ctx.font = `700 ${fontSize}px ${LABEL_FONT}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	const chars = label.split('');
	const widths = chars.map((ch) => ctx.measureText(ch).width);
	const total = widths.reduce((sum, w) => sum + w, 0);
	const radius = Math.max(drawW * 2.9, total * 3.4);
	const arc = total / radius;

	const carve = (
		ox: number,
		oy: number,
		fill: string,
		composite: GlobalCompositeOperation,
		blur = 0,
	) => {
		let angle = -arc / 2;
		ctx.save();
		ctx.globalCompositeOperation = composite;
		ctx.fillStyle = fill;
		ctx.shadowColor =
			blur > 0 ? 'rgba(210, 225, 240, 0.55)' : 'transparent';
		ctx.shadowBlur = blur;
		for (let i = 0; i < chars.length; i++) {
			const w = widths[i];
			const mid = angle + w / (2 * radius);
			ctx.save();
			ctx.translate(ox, oy + radius);
			ctx.rotate(mid);
			ctx.translate(0, -radius);
			ctx.rotate(-mid * 0.07);
			ctx.fillText(chars[i], 0, 0);
			ctx.restore();
			angle += w / radius;
		}
		ctx.restore();
	};

	carve(0, 0, 'rgba(200, 215, 230, 0.3)', 'screen', fontSize * 0.3);
	carve(groove, groove * 1.15, 'rgba(18, 12, 8, 0.45)', 'multiply');
	carve(0, 0, 'rgba(198, 212, 226, 0.88)', 'source-over');
	carve(-groove * 0.8, -groove, 'rgba(236, 244, 255, 0.55)', 'screen');
	ctx.restore();
};

/** Bake body + unique tint + silver label once. */
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
	drawLanternLabel(ctx, label, drawW, drawH);
	return sprite;
};

const drawLanternFire = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	openingW: number,
	time: number,
	phase: number,
) => {
	const t = time * 0.001;
	const flicker =
		0.88 +
		0.06 * Math.sin(t * 9 + phase) +
		0.04 * Math.sin(t * 17 + phase * 1.4);
	const lean = Math.sin(t * 7 + phase) * openingW * 0.04;
	const flameH = openingW * (0.7 + flicker * 0.22);
	const flameW = openingW * (0.17 + flicker * 0.04);

	ctx.save();
	ctx.translate(x, y);
	ctx.globalCompositeOperation = 'screen';

	const spill = ctx.createRadialGradient(0, 0, 0, 0, 0, openingW * 1.2);
	spill.addColorStop(0, `rgba(255, 230, 170, ${0.45 * flicker})`);
	spill.addColorStop(1, 'rgba(255, 80, 20, 0)');
	ctx.fillStyle = spill;
	ctx.beginPath();
	ctx.ellipse(0, openingW * 0.05, openingW, openingW * 0.55, 0, 0, Math.PI * 2);
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(lean * 0.1, 0);
	ctx.bezierCurveTo(
		lean + flameW,
		flameH * 0.25,
		lean + flameW * 0.5,
		flameH * 0.7,
		lean * 0.05,
		flameH,
	);
	ctx.bezierCurveTo(
		lean - flameW * 0.5,
		flameH * 0.7,
		lean - flameW,
		flameH * 0.25,
		lean * 0.1,
		0,
	);
	const flame = ctx.createLinearGradient(0, 0, 0, flameH);
	flame.addColorStop(0, `rgba(255, 255, 245, ${0.9 * flicker})`);
	flame.addColorStop(0.45, `rgba(255, 170, 70, ${0.7 * flicker})`);
	flame.addColorStop(1, 'rgba(255, 60, 0, 0)');
	ctx.fillStyle = flame;
	ctx.fill();
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
			if (ready && bodyImg && lanterns.length) {
				rebuildSprites();
			}
		};

		const paint = (time: number) => {
			ctx.clearRect(0, 0, width, height);
			drawSkyStars(ctx, stars, time);

			if (!bodyImg || !lanterns.length) return;

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

				drawLanternFire(
					ctx,
					cx,
					cy + drawH * 0.4,
					drawW * 0.34,
					time,
					lantern.phase,
				);

				ctx.save();
				ctx.translate(cx, cy);
				ctx.rotate(sway);
				ctx.globalAlpha = 0.72 + lantern.z * 0.24;
				ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
				ctx.restore();
			}
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
