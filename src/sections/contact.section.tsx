import type { MouseEvent } from 'react';
import { GlowLink } from '../components/glow-box-link';
import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { useToast } from '../components/toast-provider';
import { contact, gmailComposeUrl, personal, socialLinks, team } from '../data/portfolio';
import { githubContactLocked, preventLockedGithubContact } from '../lib/contact-lock';
import { discordContactHref, openDiscordContact } from '../lib/discord-contact';

const socialLinkProps = (
	link: (typeof socialLinks)[number],
	options?: {
		onGithubLockedClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
		onDiscordNotify?: (message: string) => void;
	},
) => {
	if (link.label === 'GitHub' && githubContactLocked && options?.onGithubLockedClick) {
		return {
			href: '#contact',
			onClick: options.onGithubLockedClick,
		};
	}

	if (link.action === 'discord') {
		return {
			href: discordContactHref,
			onClick: (event: MouseEvent<HTMLAnchorElement>) =>
				openDiscordContact(event, options?.onDiscordNotify),
		};
	}

	return { href: link.href };
};

export const Contact = () => {
	const { pushToast } = useToast();

	const onGithubLockedClick = (event: MouseEvent<HTMLAnchorElement>) => {
		preventLockedGithubContact(event, (message) => pushToast(message, 'info'));
	};

	return (
		<section
			className='contact'
			id='contact'
		>
			<div className='contact-glow' aria-hidden='true' />

			<div className='contact-inner container'>
				<div className='contact-layout'>
					<div className='section-sidebar contact-title'>
						<LayeredSectionTitle
							primary={contact.section.title}
							secondary={contact.section.subtitle}
							summary={contact.section.summary}
						/>
					</div>

					<div className='contact-body'>
						<Reveal delay={120}>
							<div className='contact-card glass-card'>
								<h2>{contact.headline}</h2>
								<p>{contact.subtext}</p>

								<div className='contact-actions'>
									<a
										href={gmailComposeUrl}
										className='comet-btn comet-btn-discord comet-btn-lg'
										target='_blank'
										rel='noopener noreferrer'
									>
										Send Email
									</a>
								</div>

								<div className='contact-links'>
									{socialLinks.map((link) => (
										<GlowLink
											key={link.label}
											color={link.glowColor}
											icon={<link.icon color={link.iconColor} />}
											aria-label={link.label.toLowerCase()}
											{...socialLinkProps(link, {
												onGithubLockedClick:
													link.label === 'GitHub'
														? onGithubLockedClick
														: undefined,
												onDiscordNotify: (message) =>
													pushToast(message, 'info'),
											})}
										/>
									))}
								</div>
							</div>
						</Reveal>

						<Reveal delay={240}>
							<footer className='site-footer'>
								<p>
									© {new Date().getFullYear()} {team.fullName}. Led by{' '}
									{personal.fullName}.
								</p>
							</footer>
						</Reveal>
					</div>
				</div>
			</div>
		</section>
	);
};
