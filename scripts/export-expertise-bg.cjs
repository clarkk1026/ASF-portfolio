const sharp = require('sharp');
const fs = require('fs');

const src =
	process.argv[2] ||
	'C:/Users/Administrator/.cursor/projects/d-net-portfolio-latest/assets/expertise-beach-only.webp';
const out = 'd:/net/portfolio-latest/public/expertise-night-team-field.webp';

async function main() {
	await sharp(src, { failOn: 'none' })
		.resize(1920, 1080, {
			fit: 'cover',
			position: 'centre',
			kernel: sharp.kernel.lanczos3,
		})
		.modulate({ saturation: 1.12, brightness: 1.02 })
		.sharpen({ sigma: 0.7, m1: 0.55, m2: 0.28 })
		.webp({
			quality: 86,
			smartSubsample: true,
			effort: 6,
			preset: 'photo',
		})
		.toFile(out);

	const meta = await sharp(out).metadata();
	console.log(meta.format, meta.width, meta.height, fs.statSync(out).size);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
