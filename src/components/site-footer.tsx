import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './brand-logo';
import { useToast } from './toast-provider';
import {
	expertise,
	navLinks,
	personal,
	socialLinks,
	team,
} from '../data/portfolio';
import { githubContactLocked, preventLockedGithubContact } from '../lib/contact-lock';
import { discordContactHref, openDiscordContact } from '../lib/discord-contact';

const studioLinks = navLinks.filter((link) =>
	['/team', '/expertise', '/projects', '/about', '/contact'].includes(link.href),
);

const serviceLinks = expertise.slice(0, 4).map((item) => ({
	label: item.title,
	href: '/expertise',
}));

export const SiteFooter = () => {
	const year = new Date().getFullYear();
	const { pushToast } = useToast();

	const onGithubLockedClick = (event: MouseEvent<HTMLAnchorElement>) => {
		preventLockedGithubContact(event, (message) => pushToast(message, 'info'));
	};

	return (
		<footer className='site-footer-bar'>
			<div className='site-footer-inner container'>
				<div className='site-footer-grid'>
					<div className='site-footer-brand'>
						<Link
							to='/'
							className='site-footer-logo'
							aria-label={`${team.fullName} home`}
						>
							<BrandLogo />
							<span className='site-footer-brand-name'>{team.fullName}</span>
						</Link>
						<p className='site-footer-blurb'>
							Remote software studio for web apps, Shopify storefronts, and
							Python backends — led by {personal.fullName}.
						</p>
					</div>

					<nav
						className='site-footer-col'
						aria-label='Studio'
					>
						<h2 className='site-footer-heading'>Studio</h2>
						<ul className='site-footer-list'>
							{studioLinks.map((link) => (
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
								const isGithub = link.label === 'GitHub';
								const isDiscord = link.action === 'discord';

								return (
									<a
										key={link.label}
										role='listitem'
										className='site-footer-social'
										href={
											isGithub && githubContactLocked
												? '/contact'
												: isDiscord
													? discordContactHref
													: link.href
										}
										target={isGithub && githubContactLocked ? undefined : '_blank'}
										rel={isGithub && githubContactLocked ? undefined : 'noreferrer'}
										aria-label={link.label}
										title={link.label}
										onClick={
											isGithub && githubContactLocked
												? onGithubLockedClick
												: isDiscord
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
						© {year} {team.fullName}. All rights reserved.
					</p>
					<p className='site-footer-bottom-meta'>{team.model}</p>
				</div>
			</div>
		</footer>
	);
};
