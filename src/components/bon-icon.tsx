import '../styles/bon-icon.css';

type BonIconSize = 'fab' | 'avatar';

type BonIconProps = {
	size?: BonIconSize;
	className?: string;
	decorative?: boolean;
};

export const BonIcon = ({
	size = 'fab',
	className = '',
	decorative = false,
}: BonIconProps) => (
	<svg
		className={`bon-icon bon-icon-${size} ${className}`.trim()}
		viewBox='0 0 28 28'
		role={decorative ? undefined : 'img'}
		aria-hidden={decorative ? true : undefined}
		aria-label={decorative ? undefined : 'Bon chat'}
		xmlns='http://www.w3.org/2000/svg'
	>
		<g className='bon-icon-rig'>
			<line
				className='bon-icon-antenna'
				x1='14'
				y1='4.5'
				x2='14'
				y2='8'
			/>
			<circle
				className='bon-icon-antenna-tip'
				cx='14'
				cy='3.2'
				r='1.4'
			/>
			<rect
				className='bon-icon-head'
				x='6'
				y='8'
				width='16'
				height='13'
				rx='4'
			/>
			<circle
				className='bon-icon-eye bon-icon-eye-l'
				cx='11'
				cy='13.5'
				r='1.7'
			/>
			<circle
				className='bon-icon-eye bon-icon-eye-r'
				cx='17'
				cy='13.5'
				r='1.7'
			/>
			<rect
				className='bon-icon-mouth'
				x='11'
				y='17.2'
				width='6'
				height='1.6'
				rx='0.8'
			/>
			<rect
				className='bon-icon-body'
				x='9'
				y='21'
				width='10'
				height='5'
				rx='2.2'
			/>
		</g>
	</svg>
);
