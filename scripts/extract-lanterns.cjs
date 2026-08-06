const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const src =
	'C:/Users/Administrator/.cursor/projects/d-net-portfolio-latest/assets/c__Users_Administrator_AppData_Roaming_Cursor_User_workspaceStorage_ccf981f2d55efa27f838b833bc8d85a5_images_expertise-night-sky-4k-d2e519ca-f5dc-4526-90a1-794eff0e0b38.png';
const outDir = 'd:/net/portfolio-latest/public/lanterns';
fs.mkdirSync(outDir, { recursive: true });

(async () => {
	const W = 1600;
	const H = 900;
	const { data, info } = await sharp(src)
		.resize(W, H, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
		.modulate({ brightness: 1.05, saturation: 1.25 })
		.linear(1.08, -6)
		.sharpen({ sigma: 1.1, m1: 1.1, m2: 0.55 })
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	const { width, height } = info;
	const N = width * height;
	const mask = new Uint8Array(N);

	/* Strict seed: bright warm/cyan lantern cores only */
	for (let i = 0; i < N; i++) {
		const o = i * 4;
		const r = data[o];
		const g = data[o + 1];
		const b = data[o + 2];
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const warm = r - Math.max(g, b);
		const cyan = b - Math.max(r * 0.9, g * 0.55);
		const vivid = max - min;
		if (max < 90 || vivid < 25) continue;
		if ((warm > 28 && r > 100) || (cyan > 24 && b > 120 && r < 210)) {
			mask[i] = 1;
		}
	}

	/* Limited grow toward warm paper only */
	for (let pass = 0; pass < 18; pass++) {
		const next = Uint8Array.from(mask);
		for (let y = 1; y < height - 1; y++) {
			for (let x = 1; x < width - 1; x++) {
				const i = y * width + x;
				if (mask[i]) continue;
				let near = false;
				for (let dy = -1; dy <= 1 && !near; dy++) {
					for (let dx = -1; dx <= 1; dx++) {
						if (mask[(y + dy) * width + (x + dx)]) near = true;
					}
				}
				if (!near) continue;
				const o = i * 4;
				const r = data[o];
				const g = data[o + 1];
				const b = data[o + 2];
				const max = Math.max(r, g, b);
				const warm = r - Math.max(g, b);
				const cyan = b - Math.max(r * 0.9, g * 0.55);
				if (max < 55) continue;
				if (warm > 12 || cyan > 10 || (r > 90 && g > 50 && b < 140)) {
					next[i] = 1;
				}
			}
		}
		mask.set(next);
	}

	const seen = new Uint8Array(N);
	const comps = [];
	const stack = [];
	for (let i = 0; i < N; i++) {
		if (!mask[i] || seen[i]) continue;
		let minX = width;
		let minY = height;
		let maxX = 0;
		let maxY = 0;
		let count = 0;
		stack.push(i);
		seen[i] = 1;
		while (stack.length) {
			const p = stack.pop();
			const x = p % width;
			const y = (p / width) | 0;
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
			count++;
			for (const [dx, dy] of [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1],
			]) {
				const nx = x + dx;
				const ny = y + dy;
				if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
				const j = ny * width + nx;
				if (!mask[j] || seen[j]) continue;
				seen[j] = 1;
				stack.push(j);
			}
		}
		const bw = maxX - minX + 1;
		const bh = maxY - minY + 1;
		const aspect = bh / Math.max(1, bw);
		/* Lanterns are taller than wide */
		if (count > 800 && bw > 40 && bh > 70 && aspect > 0.9 && aspect < 2.4) {
			comps.push({ minX, minY, maxX, maxY, bw, bh, count, aspect });
		}
	}
	comps.sort((a, b) => b.count - a.count);
	const top = comps.slice(0, 8);
	console.log(
		'comps',
		comps.length,
		top.map((c) => `${c.bw}x${c.bh}`),
	);

	const sky = Buffer.alloc(N * 4);
	for (let i = 0; i < N; i++) {
		const o = i * 4;
		sky[o] = 3;
		sky[o + 1] = 5;
		sky[o + 2] = 10;
		sky[o + 3] = 255;
	}
	for (let s = 0; s < 12; s++) {
		const x = (Math.random() * width) | 0;
		const y = (Math.random() * height * 0.6) | 0;
		const o = (y * width + x) * 4;
		const v = (30 + Math.random() * 55) | 0;
		sky[o] = v;
		sky[o + 1] = v;
		sky[o + 2] = v + 6;
	}
	await sharp(sky, { raw: { width, height, channels: 4 } })
		.resize(1920, 1080, { fit: 'fill' })
		.webp({ quality: 90 })
		.toFile('d:/net/portfolio-latest/public/expertise-sky-simple.webp');

	let bestAi = 0;
	let bestScore = -1;
	for (let idx = 0; idx < top.length; idx++) {
		const c = top[idx];
		let cyan = 0;
		let n = 0;
		for (let y = c.minY; y <= c.maxY; y++) {
			for (let x = c.minX; x <= c.maxX; x++) {
				if (!mask[y * width + x]) continue;
				const o = (y * width + x) * 4;
				cyan += Math.max(0, data[o + 2] - data[o]);
				n++;
			}
		}
		const score = n ? cyan / n : 0;
		if (score > bestScore) {
			bestScore = score;
			bestAi = idx;
		}
	}

	const manifest = [];
	for (let idx = 0; idx < top.length; idx++) {
		const c = top[idx];
		const pad = 6;
		const x0 = Math.max(0, c.minX - pad);
		const y0 = Math.max(0, c.minY - pad);
		const x1 = Math.min(width - 1, c.maxX + pad);
		const y1 = Math.min(height - 1, c.maxY + pad);
		const bw = x1 - x0 + 1;
		const bh = y1 - y0 + 1;
		const buf = Buffer.alloc(bw * bh * 4);
		for (let y = y0; y <= y1; y++) {
			for (let x = x0; x <= x1; x++) {
				const si = (y * width + x) * 4;
				const di = ((y - y0) * bw + (x - x0)) * 4;
				let a = 0;
				if (
					x >= c.minX &&
					x <= c.maxX &&
					y >= c.minY &&
					y <= c.maxY &&
					mask[y * width + x]
				) {
					a = 255;
				} else {
					let near = false;
					for (let dy = -2; dy <= 2 && !near; dy++) {
						for (let dx = -2; dx <= 2; dx++) {
							const nx = x + dx;
							const ny = y + dy;
							if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
							if (mask[ny * width + nx]) near = true;
						}
					}
					if (near && Math.max(data[si], data[si + 1], data[si + 2]) > 60) {
						a = 210;
					}
				}
				if (!a) continue;
				buf[di] = data[si];
				buf[di + 1] = data[si + 1];
				buf[di + 2] = data[si + 2];
				buf[di + 3] = a;
			}
		}
		const name = `lantern-${idx}.webp`;
		await sharp(buf, { raw: { width: bw, height: bh, channels: 4 } })
			.resize({
				width: Math.round(bw * 1.35),
				height: Math.round(bh * 1.35),
				kernel: sharp.kernel.lanczos3,
			})
			.modulate({ brightness: 1.05, saturation: 1.18 })
			.sharpen({ sigma: 0.8, m1: 0.9, m2: 0.45 })
			.webp({ quality: 96, alphaQuality: 100 })
			.toFile(path.join(outDir, name));
		const meta = await sharp(path.join(outDir, name)).metadata();
		manifest.push({
			src: `/lanterns/${name}`,
			w: meta.width,
			h: meta.height,
			isAi: idx === bestAi,
		});
	}

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
	console.log(manifest);
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
