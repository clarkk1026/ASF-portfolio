type BrandLogoProps = {
	className?: string;
	title?: string;
};

export const BrandLogo = ({
	className = '',
	title = 'ASF — AI, Shopify, Full Stack',
}: BrandLogoProps) => (
	<span
		className={`brand-logo ${className}`.trim()}
		role='img'
		aria-label={title}
	>
		<svg
			className='brand-logo-svg'
			viewBox='0 0 88 32'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			aria-hidden='true'
		>
			<text
				x='8'
				y='24'
				fill='#ffffff'
				fontFamily="'Fugaz One', 'Arial Black', Arial, sans-serif"
				fontSize='24'
				fontStyle='italic'
				transform='skewX(-7)'
			>
				A
			</text>
			<text
				x='38'
				y='24'
				fill='#ffffff'
				fontFamily="'Fugaz One', 'Arial Black', Arial, sans-serif"
				fontSize='24'
			>
				S
			</text>
			<text
				x='64'
				y='24'
				fill='#ffffff'
				fontFamily="'Fugaz One', 'Arial Black', Arial, sans-serif"
				fontSize='24'
			>
				F
			</text>
		</svg>
	</span>
);
