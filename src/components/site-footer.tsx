import { Link } from 'react-router-dom';
import { BrandLogo } from './brand-logo';
import { useToast } from './toast-provider';
import {
	expertise,
	navLinks,
	personal,
	socialLinks,
} from '../data/portfolio';
import { discordContactHref, openDiscordContact } from '../lib/discord-contact';

const portfolioNavLinks = navLinks.filter((link) =>
	['/expertise', '/projects', '/about', '/contact'].includes(link.href),
);

const serviceLinks = expertise.slice(0, 4).map((item) => ({
	label: item.title,
	href: '/expertise',
}));

export const SiteFooter = () => {
	const year = new Date().getFullYear();
	const { pushToast } = useToast();

	return (
		<footer className='site-footer-bar'>
			<div className='site-footer-inner container'>
				<div className='site-footer-grid'>
					<div className='site-footer-brand'>
						<Link
							to='/'
							className='site-footer-logo'
							aria-label={`${personal.fullName} home`}
						>
							<BrandLogo />
							<span className='site-footer-brand-name'>{personal.fullName}</span>
						</Link>
						<p className='site-footer-blurb'>
							AI Automation Engineer for agents, LLM applications, and
							production workflow systems.
						</p>
					</div>

					<nav
						className='site-footer-col'
						aria-label='Portfolio'
					>
						<h2 className='site-footer-heading'>Portfolio</h2>
						<ul className='site-footer-list'>
							{portfolioNavLinks.map((link) => (
								<li key={link.href}>
									<Link to={link.href}>{link.label}</Link>
								</li>
							))}
						</ul>
					</nav>

					<nav
						className='site-footer-col'
						aria-label='Services'
					>
						<h2 className='site-footer-heading'>Services</h2>
						<ul className='site-footer-list'>
							{serviceLinks.map((link) => (
								<li key={link.label}>
									<Link to={link.href}>{link.label}</Link>
								</li>
							))}
						</ul>
					</nav>

					<div className='site-footer-col site-footer-contact'>
						<h2 className='site-footer-heading'>Contact</h2>
						<div
							className='site-footer-socials'
							role='list'
						>
							{socialLinks.map((link) => {
								const Icon = link.icon;
								const isDiscord = link.action === 'discord';

								return (
									<a
										key={link.label}
										role='listitem'
										className='site-footer-social'
										href={isDiscord ? discordContactHref : link.href}
										target='_blank'
										rel='noreferrer'
										aria-label={link.label}
										title={link.label}
										onClick={
											isDiscord
												? (event) =>
														openDiscordContact(event, (message) =>
															pushToast(message, 'info'),
														)
												: undefined
										}
									>
										<Icon
											aria-hidden='true'
											color={link.iconColor}
										/>
									</a>
								);
							})}
						</div>
					</div>
				</div>

				<div className='site-footer-bottom'>
					<p>
						© {year} {personal.fullName}. All rights reserved.
					</p>
					<p className='site-footer-bottom-meta'>{personal.model}</p>
				</div>
			</div>
		</footer>
	);
};
