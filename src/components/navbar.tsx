import { BrandLogo } from './brand-logo';
import { useEffect, useState } from 'react';
import { navLinks, personal } from '../data/portfolio';

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
					href='#'
					className='navbar-logo'
				>
					<BrandLogo
						size={38}
						className='navbar-logo-img'
					/>
					<span className='navbar-logo-text'>{personal.fullName}</span>
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
					className='navbar-cta'
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
