import type { CSSProperties } from 'react';

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
				className='brand-emblem-frame'
				viewBox='0 0 40 40'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				<path d='M14 3.5H3.5V14' />
				<path d='M26 36.5h10.5V26' />
				<path d='M36.5 14V3.5H26' />
				<path d='M3.5 26v10.5H14' />
				<path
					className='brand-emblem-accent'
					d='m28.5 6.5 5 5'
				/>
			</svg>
			<span className='brand-flow'>
				<span
					className='brand-flow-letter'
					style={{ '--i': 0 } as CSSProperties}
				>
					A
				</span>
				<span
					className='brand-flow-letter'
					style={{ '--i': 1 } as CSSProperties}
				>
					S
				</span>
				<span
					className='brand-flow-letter'
					style={{ '--i': 2 } as CSSProperties}
				>
					F
				</span>
			</span>
		</span>
	</span>
);
