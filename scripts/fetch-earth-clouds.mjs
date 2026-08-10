import sharp from 'sharp';

const urls = [
	'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
	'https://cdn.jsdelivr.net/gh/turban/webgl-earth@master/images/fair_clouds_4k.png',
];

for (const url of urls) {
	try {
		const response = await fetch(url);
		console.log(url, response.status);
		if (!response.ok) continue;
		const buffer = Buffer.from(await response.arrayBuffer());
		await sharp(buffer)
			.resize(2048, 1024, { fit: 'fill' })
			.webp({ quality: 85, alphaQuality: 90 })
			.toFile('public/earth-clouds-texture.webp');
		console.log('wrote clouds from', url);
		process.exit(0);
	} catch (error) {
		console.log('err', error instanceof Error ? error.message : error);
	}
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024">
  <defs>
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="4" stitchTiles="stitch"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.7" intercept="-0.15"/>
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="black"/>
  <rect width="100%" height="100%" filter="url(#n)" fill="white"/>
</svg>`;

await sharp(Buffer.from(svg))
	.webp({ quality: 80, alphaQuality: 90 })
	.toFile('public/earth-clouds-texture.webp');
console.log('wrote procedural clouds');
