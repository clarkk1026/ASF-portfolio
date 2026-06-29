import { GlowLink } from '../components/glow-box-link';
import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { contact, gmailComposeUrl, personal, socialLinks } from '../data/portfolio';
import { discordContactHref, openDiscordContact } from '../lib/discord-contact';

const socialLinkProps = (link: (typeof socialLinks)[number]) => {
	if (link.action === 'discord') {
		return {
			href: discordContactHref,
			onClick: openDiscordContact,
		};
	}

	return { href: link.href };
};

export const Contact = () => {
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
										className='comet-btn comet-btn-email comet-btn-lg'
										target='_blank'
										rel='noopener noreferrer'
									>
										Send Email
									</a>
									<a
										href={discordContactHref}
										className='comet-btn comet-btn-discord comet-btn-lg'
										target='_blank'
										rel='noopener noreferrer'
										onClick={openDiscordContact}
									>
										Add on Discord
									</a>
								</div>
								<div className='contact-handles'>
									<p className='contact-handle'>{personal.email}</p>
									<p className='contact-handle'>
										@{personal.discordUsername}
									</p>
								</div>

								<div className='contact-links'>
									{socialLinks.map((link) => (
										<GlowLink
											key={link.label}
											color={link.glowColor}
											icon={<link.icon color={link.iconColor} />}
											aria-label={link.label.toLowerCase()}
											{...socialLinkProps(link)}
										/>
									))}
								</div>
							</div>
						</Reveal>

						<Reveal delay={240}>
							<footer className='site-footer'>
								<p>
									© {new Date().getFullYear()} {personal.fullName}. Crafted with
									React and TypeScript
								</p>
							</footer>
						</Reveal>
					</div>
				</div>
			</div>
		</section>
	);
};
