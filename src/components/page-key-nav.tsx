import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { navLinks } from '../data/portfolio';

const routes = ['/', ...navLinks.map((link) => link.href)];

export const PageKeyNav = () => {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === 'INPUT' ||
					target.tagName === 'TEXTAREA' ||
					target.isContentEditable)
			) {
				return;
			}

			const index = routes.indexOf(pathname);
			if (index < 0) return;

			if (event.key === 'ArrowRight' || event.key === ']') {
				const next = routes[(index + 1) % routes.length];
				navigate(next);
			} else if (event.key === 'ArrowLeft' || event.key === '[') {
				const prev = routes[(index - 1 + routes.length) % routes.length];
				navigate(prev);
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [navigate, pathname]);

	return null;
};
