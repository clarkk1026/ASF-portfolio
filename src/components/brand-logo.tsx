import type { ImgHTMLAttributes } from 'react';

type BrandLogoProps = ImgHTMLAttributes<HTMLImageElement> & {
	size?: number;
};

export const BrandLogo = ({
	size = 40,
	className = '',
	alt = 'Ben Clark logo',
	style,
	...props
}: BrandLogoProps) => (
	<img
		src='/ben-logo.png'
		alt={alt}
		className={`brand-logo ${className}`.trim()}
		style={{ height: size, width: 'auto', ...style }}
		{...props}
	/>
);
