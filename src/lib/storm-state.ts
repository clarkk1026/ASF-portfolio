export type StormState = {
	active: boolean;
	wind: number;
	level: number;
	/** 0 = full storm, 1 = fully sunny */
	clear: number;
	sunny: boolean;
};

export const stormState: StormState = {
	active: false,
	wind: 5,
	level: 0,
	clear: 0,
	sunny: false,
};
