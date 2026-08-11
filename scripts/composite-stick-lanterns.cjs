const sharp = require('sharp');
const fs = require('fs');

const bgSrc = 'd:/net/portfolio-latest/public/expertise-night-team-field.webp';
const bodySrc = 'd:/net/portfolio-latest/public/lanterns/lantern-body.webp';
const out = 'd:/net/portfolio-latest/public/expertise-night-team-field.webp';

const W = 2560;
const H = 1440;

const sticks = [
	{ x: 0.18, y: 0.36, h: 118, hue: -8 },
	{ x: 0.42, y: 0.28, h: 96, hue: 22 },
	{ x: 0.58, y: 0.4, h: 132, hue: 48 },
	{ x: 0.72, y: 0.24, h: 88, hue: -18 },
	{ x: 0.31, y: 0.48, h: 108, hue: 12 },
];

async function main() {
	const bg = await sharp(bgSrc, { failOn: 'none' })
		.resize(W, H, { fit: 'cover', position: 'centre' })
		.ensureAlpha()
		.toBuffer();

	const composites = [];

	for (const s of sticks) {
		const lantern = await sharp(bodySrc)
			.resize({ height: s.h, fit: 'inside' })
			.modulate({ hue: s.hue, saturation: 1.08, brightness: 1.04 })
			.ensureAlpha()
			.png()
			.toBuffer({ resolveWithObject: true });

		const lw = lantern.info.width;
		const lh = lantern.info.height;
		const glowSize = Math.round(s.h * 1.7);
		const glowSvg = Buffer.from(
			`<svg xmlns="http://www.w3.org/2000/svg" width="${glowSize}" height="${glowSize}">` +
				`<defs><radialGradient id="g" cx="50%" cy="55%" r="50%">` +
				`<stop offset="0%" stop-color="rgb(255,200,120)" stop-opacity="0.28"/>` +
				`<stop offset="45%" stop-color="rgb(255,150,70)" stop-opacity="0.1"/>` +
				`<stop offset="100%" stop-color="rgb(255,100,40)" stop-opacity="0"/>` +
				`</radialGradient></defs>` +
				`<circle cx="50%" cy="50%" r="50%" fill="url(#g)"/></svg>`,
		);

		const left = Math.round(s.x * W - lw / 2);
		const top = Math.round(s.y * H - lh / 2);
		const glowLeft = Math.round(s.x * W - glowSize / 2);
		const glowTop = Math.round(s.y * H - glowSize / 2 + lh * 0.05);

		composites.push({
			input: glowSvg,
			left: Math.max(0, glowLeft),
			top: Math.max(0, glowTop),
			blend: 'screen',
		});
		composites.push({
			input: lantern.data,
			left: Math.max(0, left),
			top: Math.max(0, top),
			blend: 'over',
		});
	}

	await sharp(bg)
		.composite(composites)
		.webp({ quality: 85, smartSubsample: true, effort: 6, preset: 'photo' })
		.toFile(out);

	const meta = await sharp(out).metadata();
	console.log(meta.format, meta.width, meta.height, fs.statSync(out).size);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
