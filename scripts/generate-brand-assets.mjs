import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const publicDir = path.join(root, 'public');
const faviconDir = path.join(publicDir, 'favicons');

const sourceLogo = path.join(publicDir, 'ben-logo.png');
const sourceIcon = path.join(publicDir, 'ben-logo-icon.png');

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

/** Flood-fill near-black pixels to transparent for crisp favicons. */
const removeNearBlackBackground = async (inputPath) => {
	const { data, info } = await sharp(inputPath)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	const pixels = new Uint8Array(data);
	const width = info.width;
	const height = info.height;
	const visited = new Uint8Array(width * height);
	const queue = [];

	const isNearBlack = (idx) => {
		const r = pixels[idx];
		const g = pixels[idx + 1];
		const b = pixels[idx + 2];
		return r < 28 && g < 28 && b < 28;
	};

	const pushIfBlack = (x, y) => {
		if (x < 0 || y < 0 || x >= width || y >= height) return;
		const i = y * width + x;
		if (visited[i]) return;
		const idx = i * 4;
		if (!isNearBlack(idx)) return;
		visited[i] = 1;
		queue.push(i);
	};

	for (let x = 0; x < width; x += 1) {
		pushIfBlack(x, 0);
		pushIfBlack(x, height - 1);
	}
	for (let y = 0; y < height; y += 1) {
		pushIfBlack(0, y);
		pushIfBlack(width - 1, y);
	}

	while (queue.length > 0) {
		const i = queue.pop();
		const x = i % width;
		const y = (i - x) / width;
		const idx = i * 4;
		pixels[idx + 3] = 0;
		pushIfBlack(x - 1, y);
		pushIfBlack(x + 1, y);
		pushIfBlack(x, y - 1);
		pushIfBlack(x, y + 1);
	}

	return sharp(Buffer.from(pixels), {
		raw: { width, height, channels: 4 },
	});
};

const writePng = async (pipeline, outPath, size) => {
	await pipeline
		.resize(size, size, {
			fit: 'contain',
			background: { r: 0, g: 0, b: 0, alpha: 0 },
			kernel: sharp.kernel.lanczos3,
		})
		.sharpen({ sigma: 0.8, m1: 0.5, m2: 0.3 })
		.png({ compressionLevel: 9, adaptiveFiltering: true })
		.toFile(outPath);
};

const writeLogo = async (pipeline, outPath, width) => {
	await pipeline
		.resize(width, null, {
			fit: 'inside',
			withoutEnlargement: false,
			kernel: sharp.kernel.lanczos3,
		})
		.sharpen({ sigma: 0.6, m1: 0.45, m2: 0.25 })
		.png({ compressionLevel: 9, adaptiveFiltering: true })
		.toFile(outPath);
};

const run = async () => {
	ensureDir(faviconDir);

	const iconTransparent = await removeNearBlackBackground(sourceIcon);
	const logoTransparent = await removeNearBlackBackground(sourceLogo);

	const faviconSizes = [16, 32, 48, 64, 128, 180, 192, 512];
	for (const size of faviconSizes) {
		const out = path.join(
			faviconDir,
			size === 180 ? 'favicon-180x180.png' : `favicon-${size}x${size}.png`,
		);
		await writePng(iconTransparent.clone(), out, size);
		console.log(`wrote ${path.relative(root, out)}`);
	}

	await writeLogo(logoTransparent.clone(), path.join(publicDir, 'ben-logo@2x.png'), 1200);
	await writeLogo(logoTransparent.clone(), path.join(publicDir, 'ben-logo-hd.png'), 900);
	console.log('wrote public/ben-logo@2x.png');
	console.log('wrote public/ben-logo-hd.png');

	// Refresh icon master at higher resolution for future exports.
	await writePng(iconTransparent.clone(), path.join(publicDir, 'ben-logo-icon-hd.png'), 1024);
	console.log('wrote public/ben-logo-icon-hd.png');
};

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
