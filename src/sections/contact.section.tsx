import type { MouseEvent } from 'react';
import { GlowLink } from '../components/glow-box-link';
import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { useToast } from '../components/toast-provider';
import {
	contact,
	gmailComposeUrl,
	socialLinks,
	whatsappUrl,
} from '../data/portfolio';
import { discordContactHref, openDiscordContact } from '../lib/discord-contact';

const socialLinkProps = (
	link: (typeof socialLinks)[number],
	options?: {
		onDiscordNotify?: (message: string) => void;
	},
) => {
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
						<Reveal delay={100}>
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
									<a
										href={whatsappUrl}
										className='comet-btn comet-btn-contact comet-btn-lg'
										target='_blank'
										rel='noopener noreferrer'
									>
										WhatsApp
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
												onDiscordNotify: (message) =>
													pushToast(message, 'info'),
											})}
										/>
									))}
								</div>
							</div>
						</Reveal>
					</div>
				</div>
			</div>
		</section>
	);
};
