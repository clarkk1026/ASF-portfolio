import { useEffect, useRef } from 'react';

const HEX_SIZE = 40;
const GLOW_RADIUS = 280;
const DECAY = 0.92;

interface Hex {
	cx: number;
	cy: number;
	glow: number;
	corners: [number, number][];
}

function hexCorners(cx: number, cy: number, r: number): [number, number][] {
	return Array.from({ length: 6 }, (_, i) => {
		const angle = (Math.PI / 3) * i - Math.PI / 6;
		return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
	});
}

export const HexBg = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animId: number;
		let hexes: Hex[] = [];
		const mouse = { x: -9999, y: -9999 };

		const buildGrid = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;

			hexes = [];
			const colW = HEX_SIZE * Math.sqrt(3);
			const rowH = HEX_SIZE * 1.5;
			const cols = Math.ceil(canvas.width / colW) + 2;
			const rows = Math.ceil(canvas.height / rowH) + 2;

			for (let row = -1; row < rows; row++) {
				for (let col = -1; col < cols; col++) {
					const cx = col * colW + (row % 2 !== 0 ? colW / 2 : 0);
					const cy = row * rowH;
					hexes.push({
						cx,
						cy,
						glow: 0,
						corners: hexCorners(cx, cy, HEX_SIZE - 1.5),
					});
				}
			}
		};

		const frame = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (const hex of hexes) {
				const dx = hex.cx - mouse.x;
				const dy = hex.cy - mouse.y;
				const distanceSquared = dx * dx + dy * dy;

				if (distanceSquared < GLOW_RADIUS * GLOW_RADIUS) {
					const dist = Math.sqrt(distanceSquared);
					const strength = (1 - dist / GLOW_RADIUS) ** 1.6;
					hex.glow = Math.max(hex.glow, strength);
				}
				hex.glow *= DECAY;

				if (hex.glow < 0.004) continue;

				ctx.beginPath();
				ctx.moveTo(hex.corners[0][0], hex.corners[0][1]);
				for (let i = 1; i < hex.corners.length; i++) {
					ctx.lineTo(hex.corners[i][0], hex.corners[i][1]);
				}
				ctx.closePath();

				ctx.fillStyle = `rgba(31,195,255,${hex.glow * 0.11})`;
				ctx.fill();

				ctx.strokeStyle = `rgba(120,180,255,${hex.glow * 0.75})`;
				ctx.lineWidth = 0.9;
				ctx.stroke();

				// inner glow highlight on the brightest hexes
				if (hex.glow > 0.4) {
					const cx = hex.cx;
					const cy = hex.cy;
					const grad = ctx.createRadialGradient(
						cx,
						cy,
						0,
						cx,
						cy,
						HEX_SIZE * 0.8,
					);
					grad.addColorStop(0, `rgba(147,130,255,${(hex.glow - 0.4) * 0.22})`);
					grad.addColorStop(0.5, `rgba(31,195,255,${(hex.glow - 0.4) * 0.18})`);
					grad.addColorStop(1, 'rgba(31,195,255,0)');
					ctx.beginPath();
					ctx.moveTo(hex.corners[0][0], hex.corners[0][1]);
					for (let i = 1; i < hex.corners.length; i++) {
						ctx.lineTo(hex.corners[i][0], hex.corners[i][1]);
					}
					ctx.closePath();
					ctx.fillStyle = grad;
					ctx.fill();
				}
			}

			animId = requestAnimationFrame(frame);
		};

		const onMouseMove = (e: MouseEvent) => {
			mouse.x = e.clientX;
			mouse.y = e.clientY;
		};

		const onMouseLeave = () => {
			mouse.x = -9999;
			mouse.y = -9999;
		};

		buildGrid();
		frame();

		window.addEventListener('resize', buildGrid);
		window.addEventListener('pointermove', onMouseMove, { passive: true });
		document.addEventListener('mouseleave', onMouseLeave);

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener('resize', buildGrid);
			window.removeEventListener('pointermove', onMouseMove);
			document.removeEventListener('mouseleave', onMouseLeave);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className='hex-canvas'
		/>
	);
};
