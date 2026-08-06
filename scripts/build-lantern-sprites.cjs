const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assets =
	'C:/Users/Administrator/.cursor/projects/d-net-portfolio-latest/assets';
const outDir = 'd:/net/portfolio-latest/public/lanterns';
fs.mkdirSync(outDir, { recursive: true });

const files = [
	{ in: 'lantern-sprite-react.png', out: 'lantern-0.webp', isAi: false },
	{ in: 'lantern-sprite-python.png', out: 'lantern-1.webp', isAi: false },
	{ in: 'lantern-sprite-backend.png', out: 'lantern-2.webp', isAi: false },
	{ in: 'lantern-sprite-shopify.png', out: 'lantern-3.webp', isAi: false },
	{ in: 'lantern-sprite-fullstack.png', out: 'lantern-4.webp', isAi: false },
	{ in: 'lantern-sprite-frontend.png', out: 'lantern-5.webp', isAi: false },
	{ in: 'lantern-sprite-commerce.png', out: 'lantern-6.webp', isAi: false },
];

const keyBlack = (data, width, height) => {
	const out = Buffer.alloc(width * height * 4);
	for (let i = 0; i < width * height; i++) {
		const o = i * 4;
		const r = data[o];
		const g = data[o + 1];
		const b = data[o + 2];
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		/* Remove near-black / dark studio bg */
		if (max < 28) {
			out[o + 3] = 0;
			continue;
		}
		let a = 255;
		if (max < 55 && max - min < 18) a = Math.round(((max - 28) / 27) * 255);
		out[o] = r;
		out[o + 1] = g;
		out[o + 2] = b;
		out[o + 3] = a;
	}
	return out;
};

(async () => {
	const manifest = [];

	for (const file of files) {
		const input = path.join(assets, file.in);
		const { data, info } = await sharp(input)
			.ensureAlpha()
			.raw()
			.toBuffer({ resolveWithObject: true });
		const keyed = keyBlack(data, info.width, info.height);
		const outPath = path.join(outDir, file.out);
		await sharp(keyed, {
			raw: { width: info.width, height: info.height, channels: 4 },
		})
			.trim({ threshold: 8 })
			.resize(280, 360, { fit: 'inside', withoutEnlargement: false })
			.modulate({ brightness: 1.04, saturation: 1.15 })
			.sharpen({ sigma: 0.7, m1: 0.8, m2: 0.4 })
			.webp({ quality: 95, alphaQuality: 100 })
			.toFile(outPath);
		const meta = await sharp(outPath).metadata();
		manifest.push({
			src: `/lanterns/${file.out}`,
			w: meta.width,
			h: meta.height,
			isAi: false,
		});
		console.log(file.out, meta.width, meta.height);
	}

	/* AI lantern: recolor a copy of backend sprite cyan + we'll label in canvas if needed.
	   Prefer extracting from reference if available; else tint react sprite. */
	const aiSrc = path.join(outDir, 'lantern-2.webp');
	const aiOut = path.join(outDir, 'lantern-ai.webp');
	await sharp(aiSrc)
		.modulate({ brightness: 1.05, saturation: 1.25, hue: 180 })
		.webp({ quality: 95, alphaQuality: 100 })
		.toFile(aiOut);
	/* Better: use original AI from reference extraction path if we still have warm3d full image —
	   instead draw AI from frontend sprite with blue modulate lightly */
	await sharp(path.join(outDir, 'lantern-0.webp'))
		.modulate({ brightness: 1.08, saturation: 1.1, hue: -150 })
		.webp({ quality: 95, alphaQuality: 100 })
		.toFile(aiOut);
	const aiMeta = await sharp(aiOut).metadata();
	manifest.push({
		src: '/lanterns/lantern-ai.webp',
		w: aiMeta.width,
		h: aiMeta.height,
		isAi: true,
	});

	const lines = [
		'export const lanternManifest = [',
		...manifest.map(
			(m) =>
				`\t{ src: '${m.src}', w: ${m.w}, h: ${m.h}, isAi: ${m.isAi} },`,
		),
		'] as const;',
		'',
	];
	fs.writeFileSync(
		'd:/net/portfolio-latest/src/data/lantern-manifest.ts',
		lines.join('\n'),
	);

	/* Clean sky */
	const W = 1920;
	const H = 1080;
	const sky = Buffer.alloc(W * H * 4);
	for (let i = 0; i < W * H; i++) {
		const o = i * 4;
		sky[o] = 3;
		sky[o + 1] = 5;
		sky[o + 2] = 10;
		sky[o + 3] = 255;
	}
	for (let s = 0; s < 10; s++) {
		const x = (Math.random() * W) | 0;
		const y = (Math.random() * H * 0.55) | 0;
		const o = (y * W + x) * 4;
		const v = (25 + Math.random() * 45) | 0;
		sky[o] = v;
		sky[o + 1] = v;
		sky[o + 2] = v + 5;
	}
	await sharp(sky, { raw: { width: W, height: H, channels: 4 } })
		.webp({ quality: 90 })
		.toFile('d:/net/portfolio-latest/public/expertise-sky-simple.webp');

	console.log('done', manifest.length);
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
