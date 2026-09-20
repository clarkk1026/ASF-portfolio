const brandLetterMeta = {
	B: {
		label: 'Ben',
		color: '#3de8ff',
	},
	C: {
		label: 'Clark',
		color: '#a78bfa',
	},
} as const;

const brandLetterColors = {
	B: brandLetterMeta.B.color,
	C: brandLetterMeta.C.color,
} as const;

export type BrandLetter = keyof typeof brandLetterColors;

export const brandLetterClass = (letter: BrandLetter) =>
	`brand-letter brand-letter-${letter.toLowerCase()}`;
