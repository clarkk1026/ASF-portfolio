type SainniBrandLogoProps = {
	className?: string;
};

export const SainniBrandLogo = ({ className = '' }: SainniBrandLogoProps) => (
	<svg
		className={className}
		viewBox='0 0 132 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<defs>
			<linearGradient
				id='sainni-hex'
				x1='4'
				y1='2'
				x2='28'
				y2='30'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#3b82f6' />
				<stop offset='1' stopColor='#1d4ed8' />
			</linearGradient>
		</defs>
		<polygon
			points='16,2 28,9 28,23 16,30 4,23 4,9'
			fill='url(#sainni-hex)'
			stroke='rgba(255,255,255,0.18)'
			strokeWidth='0.6'
		/>
		<path
			d='M11.5 10.5c0-1.6 1.4-2.8 3.6-2.8 2.1 0 3.7 1 3.7 2.7 0 1.2-.9 2-2.8 2.4l-1.8.4c-2.2.5-3.4 1.6-3.4 3.4 0 2.2 2 3.6 4.8 3.6 2.6 0 4.6-1.2 4.8-3.2'
			stroke='#ffffff'
			strokeWidth='1.8'
			strokeLinecap='round'
			fill='none'
		/>
		<text
			x='36'
			y='21'
			fill='#ffffff'
			fontFamily='system-ui, -apple-system, Segoe UI, sans-serif'
			fontSize='13.5'
			fontWeight='700'
			letterSpacing='0.14em'
		>
			SAINNI
		</text>
	</svg>
);
