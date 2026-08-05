import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { navLinks } from '../data/portfolio';
import { BrandLogo } from './brand-logo';

export const Navbar = () => {
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		let lastScrolled = window.scrollY > 48;
		setScrolled(lastScrolled);

		const onScroll = () => {
			const nextScrolled = window.scrollY > 48;
			if (nextScrolled === lastScrolled) return;
			lastScrolled = nextScrolled;
			setScrolled(nextScrolled);
		};
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
				<Link
					to='/'
					className='navbar-brand'
					onClick={() => setMenuOpen(false)}
					aria-label='ASF Studio — home'
				>
					<BrandLogo />
				</Link>

				<ul className={`navbar-links ${menuOpen ? 'navbar-links-open' : ''}`}>
					{navLinks.map((link) => (
						<li key={link.href}>
							<NavLink
								to={link.href}
								className={({ isActive }) =>
									isActive ? 'navbar-link-active' : undefined
								}
								onClick={() => setMenuOpen(false)}
							>
								{link.label}
							</NavLink>
						</li>
					))}
				</ul>

				<Link
					to='/contact'
					className='comet-btn comet-btn-talk navbar-cta'
					onClick={() => setMenuOpen(false)}
				>
					Let&apos;s Talk
				</Link>

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
