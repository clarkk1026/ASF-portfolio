import { BrandLogo } from './brand-logo';
import { useState, type MouseEvent } from 'react';
import { navLinks, personal } from '../data/portfolio';
import { useGlobe } from '../lib/globe-context';

export const Navbar = () => {
	const { activeIndex, rotateToHash, rotateToIndex, introComplete } = useGlobe();
	const [menuOpen, setMenuOpen] = useState(false);
	const scrolled = introComplete && activeIndex > 0;

	const handleNavClick = (
		event: MouseEvent<HTMLAnchorElement>,
		href: string,
	) => {
		event.preventDefault();
		setMenuOpen(false);
		rotateToHash(href);
	};

	return (
		<header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
			<nav className='navbar-inner container'>
				<a
					href='#home'
					className='navbar-logo'
					onClick={(event) => {
						event.preventDefault();
						setMenuOpen(false);
						rotateToIndex(0);
					}}
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
								onClick={(event) => handleNavClick(event, link.href)}
							>
								{link.label}
							</a>
						</li>
					))}
				</ul>

				<a
					href='#contact'
					className='navbar-cta'
					onClick={(event) => handleNavClick(event, '#contact')}
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
