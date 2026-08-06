const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const src =
	'C:/Users/Administrator/.cursor/projects/d-net-portfolio-latest/assets/lantern-blank-template.png';
const outDir = 'd:/net/portfolio-latest/public/lanterns';
fs.mkdirSync(outDir, { recursive: true });

(async () => {
	const { data, info } = await sharp(src)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });
	const { width, height } = info;
	const out = Buffer.alloc(width * height * 4);

	for (let i = 0; i < width * height; i++) {
		const o = i * 4;
		const r = data[o];
		const g = data[o + 1];
		const b = data[o + 2];
		const a = data[o + 3];
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const chroma = max - min;

		/* Hard-key pure/near black studio background */
		if (max < 32 || (max < 48 && chroma < 14)) {
			out[o + 3] = 0;
			continue;
		}

		let alpha = a;
		if (max < 70 && chroma < 22) {
			alpha = Math.round(Math.max(0, ((max - 32) / 38) * 255));
		}

		out[o] = r;
		out[o + 1] = g;
		out[o + 2] = b;
		out[o + 3] = alpha;
	}

	const amberPath = path.join(outDir, 'lantern-body.webp');
	await sharp(out, { raw: { width, height, channels: 4 } })
		.trim({ threshold: 5 })
		.resize(320, 420, { fit: 'inside' })
		.modulate({ brightness: 1.05, saturation: 1.12 })
		.sharpen({ sigma: 0.7, m1: 0.8, m2: 0.4 })
		.webp({ quality: 96, alphaQuality: 100 })
		.toFile(amberPath);

	const meta = await sharp(amberPath).metadata();
	console.log('body', meta.width, meta.height, 'hasAlpha', meta.hasAlpha);

	/* Cool night sky */
	const W = 1920;
	const H = 1080;
	const sky = Buffer.alloc(W * H * 3);
	for (let y = 0; y < H; y++) {
		const t = y / H;
		const r = Math.round(4 + t * 6);
		const g = Math.round(8 + t * 10);
		const b = Math.round(18 + t * 14);
		for (let x = 0; x < W; x++) {
			const o = (y * W + x) * 3;
			sky[o] = r;
			sky[o + 1] = g;
			sky[o + 2] = b;
		}
	}
	await sharp(sky, { raw: { width: W, height: H, channels: 3 } })
		.webp({ quality: 90 })
		.toFile('d:/net/portfolio-latest/public/expertise-sky-simple.webp');

	console.log('sky ok');
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
