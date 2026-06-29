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
		className={`brand-logo-block ${className}`.trim()}
		style={
			{
				'--logo-size': `${size}px`,
				...style,
			} as CSSProperties
		}
		{...props}
	>
		<span className='brand-logo-block-scene'>
			<span className='brand-logo-block-cube'>
				<span className='brand-logo-block-face'>
					<img
						src='/ben-logo.png'
						alt='Ben Clark logo'
						className='brand-logo-image'
						draggable={false}
					/>
				</span>
			</span>
		</span>
	</span>
);
