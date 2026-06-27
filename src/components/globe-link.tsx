import type { MouseEvent, ReactNode } from 'react';
import { useGlobe } from '../lib/globe-context';

type GlobeLinkProps = {
	href: string;
	className?: string;
	children: ReactNode;
	'aria-label'?: string;
	onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export const GlobeLink = ({
	href,
	className,
	children,
	'aria-label': ariaLabel,
	onClick,
}: GlobeLinkProps) => {
	const { rotateToHash } = useGlobe();

	return (
		<a
			href={href}
			className={className}
			aria-label={ariaLabel}
			onClick={(event) => {
				event.preventDefault();
				rotateToHash(href);
				onClick?.(event);
			}}
		>
			{children}
		</a>
	);
};
