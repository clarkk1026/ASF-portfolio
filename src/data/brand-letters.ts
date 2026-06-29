const brandLetterMeta = {
	A: {
		label: 'AI',
		color: '#a78bfa',
	},
	F: {
		label: 'Full Stack',
		color: '#f97316',
	},
} as const;

const brandLetterColors = {
	A: brandLetterMeta.A.color,
	F: brandLetterMeta.F.color,
} as const;

export type BrandLetter = keyof typeof brandLetterColors;

export const brandLetterClass = (letter: BrandLetter) =>
	`brand-letter brand-letter-${letter.toLowerCase()}`;
