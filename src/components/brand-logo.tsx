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
		<span className='brand-emblem' aria-hidden='true'>
			<svg
				viewBox='0 0 44 44'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				<path
					className='brand-emblem-frame'
					d='M13 3.5h18L40.5 13v18L31 40.5H13L3.5 31V13L13 3.5Z'
				/>
				<path
					className='brand-emblem-mark'
					d='m12.2 31.5 8.1-20h3.9l8 20h-4.7l-1.6-4.3H18.5l-1.6 4.3h-4.7Zm8-8.8h4l-2-5.7-2 5.7Z'
				/>
				<path
					className='brand-emblem-cut'
					d='M29.5 10.5 35 16'
				/>
			</svg>
		</span>
		<span className='brand-wordmark' aria-hidden='true'>
			<span className='brand-wordmark-name'>ASF</span>
			<span className='brand-wordmark-subtitle'>Software Studio</span>
		</span>
	</span>
);
