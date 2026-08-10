type EarthFabGlobeProps = {
	className?: string;
};

const NODES = [
	{ cx: 28, cy: 38, delay: '0s' },
	{ cx: 42, cy: 52, delay: '1.1s' },
	{ cx: 58, cy: 34, delay: '0.4s' },
	{ cx: 70, cy: 48, delay: '1.8s' },
	{ cx: 36, cy: 62, delay: '2.4s' },
	{ cx: 64, cy: 60, delay: '0.9s' },
] as const;

/** Slow-living realistic 3D Earth for the Bon chat FAB. */
export const EarthFabGlobe = ({ className = '' }: EarthFabGlobeProps) => (
	<span
		className={`earth-fab-globe ${className}`.trim()}
		aria-hidden='true'
	>
		<span className='earth-fab-globe-sphere'>
			<span className='earth-fab-globe-map' />
			<span className='earth-fab-globe-clouds' />
			<span className='earth-fab-globe-comms'>
				<svg
					className='earth-fab-globe-comms-svg'
					viewBox='0 0 100 100'
					preserveAspectRatio='xMidYMid slice'
				>
					<path
						className='earth-fab-globe-arc earth-fab-globe-arc-a'
						d='M28 40 C 38 18, 54 16, 68 36'
					/>
					<path
						className='earth-fab-globe-arc earth-fab-globe-arc-b'
						d='M36 62 C 48 44, 62 40, 72 50'
					/>
					<path
						className='earth-fab-globe-arc earth-fab-globe-arc-c'
						d='M30 50 C 44 70, 58 72, 70 44'
					/>
					<path
						className='earth-fab-globe-arc earth-fab-globe-arc-d'
						d='M42 34 C 50 52, 56 58, 64 42'
					/>
					{NODES.map((node) => (
						<circle
							key={`${node.cx}-${node.cy}`}
							className='earth-fab-globe-node'
							cx={node.cx}
							cy={node.cy}
							r='1.15'
							style={{ animationDelay: node.delay }}
						/>
					))}
				</svg>
			</span>
			<span className='earth-fab-globe-shade' />
			<span className='earth-fab-globe-rim' />
			<span className='earth-fab-globe-specular' />
		</span>
	</span>
);
