export const COMET_CURSOR_HIT_RADIUS = 16;

export type CometPointer = {
	x: number;
	y: number;
	active: boolean;
	hidden: boolean;
};

let pointer: CometPointer = {
	x: -9999,
	y: -9999,
	active: false,
	hidden: false,
};

let impactPulse = 0;

export const updateCometPointer = (next: CometPointer) => {
	pointer = next;
};

export const getCometPointer = () => pointer;

export const triggerCometImpact = () => {
	impactPulse = 1;
};

export const getCometImpactPulse = () => impactPulse;

export const decayCometImpactPulse = (amount: number) => {
	impactPulse = Math.max(0, impactPulse - amount);
};

export const hitCometPointer = (
	x: number,
	y: number,
	extraRadius = 0,
) => {
	if (!pointer.active || pointer.hidden) return false;

	const radius = COMET_CURSOR_HIT_RADIUS + extraRadius;
	const dx = x - pointer.x;
	const dy = y - pointer.y;
	return dx * dx + dy * dy <= radius * radius;
};

export const segmentHitsCometPointer = (
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	extraRadius = 0,
) => {
	if (!pointer.active || pointer.hidden) return false;

	const radius = COMET_CURSOR_HIT_RADIUS + extraRadius;
	const dx = x2 - x1;
	const dy = y2 - y1;
	const len2 = dx * dx + dy * dy;

	if (len2 === 0) {
		return hitCometPointer(x1, y1, extraRadius);
	}

	let t = ((pointer.x - x1) * dx + (pointer.y - y1) * dy) / len2;
	t = Math.max(0, Math.min(1, t));

	const px = x1 + t * dx;
	const py = y1 + t * dy;
	const distX = px - pointer.x;
	const distY = py - pointer.y;
	return distX * distX + distY * distY <= radius * radius;
};
