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
