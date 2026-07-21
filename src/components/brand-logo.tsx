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
		<span className='brand-lockup' aria-hidden='true'>
			<span className='brand-emblem'>
				<svg
					viewBox='0 0 40 40'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						className='brand-emblem-frame'
						d='M15 4H5v11M25 36h10V25M35 15V5H25M5 25v10h10'
					/>
					<path
						className='brand-emblem-a'
						fillRule='evenodd'
						d='M10.5 30 18 10h4l7.5 20h-5L23 25.5h-6L15.5 30h-5Zm8-9h3L20 16.2 18.5 21Z'
					/>
					<path
						className='brand-emblem-accent'
						d='m29 7 4 4'
					/>
				</svg>
			</span>
			<span className='brand-wordmark'>
				<span className='brand-wordmark-name'>ASF</span>
				<span className='brand-foundation'>
					<span className='brand-foundation-lead' />
					<span />
					<span />
					<span />
					<span />
				</span>
			</span>
		</span>
	</span>
);
