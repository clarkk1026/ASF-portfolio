import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'public/favicon-mark.svg');
const dir = path.join(root, 'public/favicons');
const sizes = [16, 32, 48, 180, 192];

for (const size of sizes) {
	const name =
		size === 180 ? 'favicon-180x180.png' : `favicon-${size}x${size}.png`;
	await sharp(src).resize(size, size).png().toFile(path.join(dir, name));
	console.log('wrote', name);
}

const ogWidth = 1200;
const ogHeight = 630;
const logoSize = 300;
const logoBuffer = await sharp(src).resize(logoSize, logoSize).png().toBuffer();

await sharp({
	create: {
		width: ogWidth,
		height: ogHeight,
		channels: 3,
		background: { r: 0, g: 0, b: 0 },
	},
})
	.composite([{ input: logoBuffer, gravity: 'center' }])
	.png()
	.toFile(path.join(root, 'public/og-image.png'));

console.log('wrote og-image.png');
