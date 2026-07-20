import { useEffect, useState } from 'react';
import { navLinks } from '../data/portfolio';
import { BrandLogo } from './brand-logo';

export const Navbar = () => {
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 48);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = menuOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [menuOpen]);

	return (
		<header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
			<nav className='navbar-inner container'>
				<a
					href='#home'
					className='navbar-brand'
					onClick={() => setMenuOpen(false)}
					aria-label='ASF Studio — home'
				>
					<BrandLogo />
				</a>

				<ul className={`navbar-links ${menuOpen ? 'navbar-links-open' : ''}`}>
					{navLinks.map((link) => (
						<li key={link.href}>
							<a
								href={link.href}
								onClick={() => setMenuOpen(false)}
							>
								{link.label}
							</a>
						</li>
					))}
				</ul>

				<a
					href='#contact'
					className='comet-btn comet-btn-talk navbar-cta'
					onClick={() => setMenuOpen(false)}
				>
					Let&apos;s Talk
				</a>

				<button
					type='button'
					className={`navbar-toggle ${menuOpen ? 'navbar-toggle-open' : ''}`}
					aria-label='Toggle menu'
					onClick={() => setMenuOpen((open) => !open)}
				>
					<span />
					<span />
					<span />
				</button>
			</nav>
		</header>
	);
};
