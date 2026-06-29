/** CSS reference: 1mm ≈ 96/25.4 px at 96dpi. */
const MM_TO_PX = 96 / 25.4;

export const SCROLL_RAIL_WIDTH_PX = 64;

/** 2mm radius handoff disc centered on the scroll comet head. */
export const SCROLL_COMET_HANDOFF_RADIUS_MM = 2;
export const SCROLL_COMET_HANDOFF_RADIUS =
	SCROLL_COMET_HANDOFF_RADIUS_MM * MM_TO_PX;

export type ScrollCometPointer = {
	x: number;
	y: number;
	visible: boolean;
};

let pointer: ScrollCometPointer = { x: -9999, y: -9999, visible: false };

export const updateScrollCometPointer = (next: ScrollCometPointer) => {
	pointer = next;
};

export const readScrollCometPointer = () => pointer;

export const isNearScrollCometPointer = (x: number, y: number) => {
	if (!pointer.visible) return false;

	const radius = SCROLL_COMET_HANDOFF_RADIUS;
	const dy = Math.abs(y - pointer.y);
	const onRail = x >= window.innerWidth - SCROLL_RAIL_WIDTH_PX;

	// On the scroll rail, match vertically within 2mm (rail is narrow vs head X).
	if (onRail) {
		return dy <= radius;
	}

	const dx = x - pointer.x;
	return dx * dx + dy * dy <= radius * radius;
};
