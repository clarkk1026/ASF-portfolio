import type { HTMLAttributes } from 'react';
import { brandLetterClass, brandLogoLetters } from '../data/brand-letters';

type BrandLogoProps = HTMLAttributes<HTMLSpanElement>;

export const BrandLogo = ({
	className = '',
	...props
}: BrandLogoProps) => (
	<span
		className={`brand-logo ${className}`.trim()}
		{...props}
	>
		{brandLogoLetters.map((letter) => (
			<span
				key={letter}
				className={brandLetterClass(letter)}
			>
				{letter}
			</span>
		))}
	</span>
);
