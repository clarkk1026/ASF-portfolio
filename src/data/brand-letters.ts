export const brandLetterMeta = {
	A: {
		label: 'AI',
		color: '#a78bfa',
	},
	S: {
		label: 'Shopify',
		color: '#96bf47',
	},
	F: {
		label: 'Full Stack',
		color: '#f97316',
	},
} as const;

export const brandLetterColors = {
	A: brandLetterMeta.A.color,
	S: brandLetterMeta.S.color,
	F: brandLetterMeta.F.color,
} as const;

export type BrandLetter = keyof typeof brandLetterColors;

export const brandLogoLetters: BrandLetter[] = ['A', 'S', 'F'];

export const brandLetterClass = (letter: BrandLetter) =>
	`brand-letter brand-letter-${letter.toLowerCase()}`;
