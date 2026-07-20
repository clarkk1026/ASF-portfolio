type BrandLogoProps = {
	className?: string;
	title?: string;
};

export const BrandLogo = ({
	className = '',
	title = 'ASF Studio',
}: BrandLogoProps) => (
	<span
		className={`brand-logo ${className}`.trim()}
		role='img'
		aria-label={title}
	>
		<span className='brand-word brand-word-asf' aria-hidden='true'>
			ASF
		</span>
	</span>
);
