import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '../hooks/use-in-view';

type RevealProps = {
	children: ReactNode;
	className?: string;
	delay?: number;
	direction?: 'up' | 'down' | 'left' | 'right' | 'none';
};

export const Reveal = ({
	children,
	className = '',
	delay = 0,
	direction = 'up',
}: RevealProps) => {
	const { ref, inView } = useInView();

	const style = {
		'--reveal-delay': `${delay}ms`,
	} as CSSProperties;

	return (
		<div
			ref={ref as React.RefObject<HTMLDivElement>}
			className={`reveal reveal-${direction} ${inView ? 'reveal-visible' : ''} ${className}`}
			style={style}
		>
			{children}
		</div>
	);
};
