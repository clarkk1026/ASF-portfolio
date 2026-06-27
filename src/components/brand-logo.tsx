import type { ImgHTMLAttributes } from 'react';

type BrandLogoProps = ImgHTMLAttributes<HTMLImageElement> & {
	size?: number;
};

export const BrandLogo = ({
	size = 40,
	className = '',
	alt = 'Ben Clark logo',
	...props
}: BrandLogoProps) => (
	<img
		src='/logo.svg'
		alt={alt}
		width={size}
		height={size}
		className={`brand-logo ${className}`.trim()}
		{...props}
	/>
);
