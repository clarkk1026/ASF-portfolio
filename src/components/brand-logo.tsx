import type { CSSProperties, HTMLAttributes } from 'react';

type BrandLogoProps = HTMLAttributes<HTMLSpanElement> & {
	size?: number;
};

export const BrandLogo = ({
	size = 56,
	className = '',
	style,
	...props
}: BrandLogoProps) => (
	<span
		className={`brand-logo ${className}`.trim()}
		style={
			{
				'--logo-size': `${size}px`,
				...style,
			} as CSSProperties
		}
		{...props}
	>
		<span className='brand-logo-scene'>
			<img
				src='/ben-logo-hd.png'
				srcSet='/ben-logo-hd.png 1x, /ben-logo@2x.png 2x'
				alt='Ben Clark logo'
				className='brand-logo-image'
				width={size}
				height={Math.round(size * (529 / 547))}
				draggable={false}
				decoding='async'
			/>
		</span>
	</span>
);
