type BrandLogoProps = {
	size?: number;
	className?: string;
	showLabel?: boolean;
	title?: string;
};

export const BrandLogo = ({
	size = 40,
	className = '',
	showLabel = false,
	title = 'Ben Clark — AI, Shopify, Full Stack',
}: BrandLogoProps) => (
	<span
		className={`brand-logo ${className}`.trim()}
		role='img'
		aria-label={title}
	>
		<svg
			className='brand-logo-mark'
			width={size}
			height={size}
			viewBox='0 0 64 64'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			aria-hidden='true'
		>
			<rect
				width='64'
				height='64'
				rx='14'
				fill='#080d16'
			/>
			<rect
				x='1.25'
				y='1.25'
				width='61.5'
				height='61.5'
				rx='12.75'
				stroke='rgba(31, 195, 255, 0.28)'
				strokeWidth='1.25'
			/>

			<path
				d='M12 40 L34 18'
				stroke='#c4b5fd'
				strokeWidth='5'
				strokeLinecap='round'
			/>
			<path
				d='M12 46 L40 24'
				stroke='#96bf47'
				strokeWidth='5'
				strokeLinecap='round'
			/>
			<path
				d='M12 52 L46 30'
				stroke='#fb923c'
				strokeWidth='5'
				strokeLinecap='round'
			/>

			<circle
				cx='48'
				cy='22'
				r='7'
				fill='url(#brand-head-glow)'
			/>
			<circle
				cx='48'
				cy='22'
				r='3.2'
				fill='#ffffff'
			/>

			<defs>
				<radialGradient
					id='brand-head-glow'
					cx='0'
					cy='0'
					r='1'
					gradientUnits='userSpaceOnUse'
					gradientTransform='translate(48 22) scale(7)'
				>
					<stop stopColor='#ffffff' />
					<stop
						offset='0.45'
						stopColor='#b8e8ff'
					/>
					<stop
						offset='1'
						stopColor='#1fc3ff'
						stopOpacity='0'
					/>
				</radialGradient>
			</defs>
		</svg>

		{showLabel ? (
			<span className='brand-logo-label'>
				<span className='brand-logo-name'>Ben Clark</span>
				<span className='brand-logo-tag'>AI · Shopify · Full Stack</span>
			</span>
		) : null}
	</span>
);
