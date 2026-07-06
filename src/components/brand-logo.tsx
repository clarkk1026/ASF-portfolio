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
		<span
			className='brand-logo-mark'
			aria-hidden='true'
		>
			<span className='brand-logo-a'>A</span>
			<span className='brand-logo-s'>S</span>
			<span className='brand-logo-f'>F</span>
		</span>
	</span>
);
