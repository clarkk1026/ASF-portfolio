import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/use-document-title';

type PageShellProps = {
	title: string;
	children: ReactNode;
	backdrop?: ReactNode;
	home?: boolean;
};

export const PageShell = ({
	title,
	children,
	backdrop,
	home = false,
}: PageShellProps) => {
	const { pathname } = useLocation();
	useDocumentTitle(title);

	return (
		<main
			key={pathname}
			className={`page-shell${home ? ' page-shell-home' : ' page-shell-inner'}`}
		>
			{backdrop}
			<div
				className='page-transition'
				aria-hidden='true'
			>
				<span className='page-transition-veil' />
				<span className='page-transition-streak' />
			</div>
			<div className='page-shell-content'>{children}</div>
		</main>
	);
};
