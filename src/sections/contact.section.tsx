import { GlowLink } from '../components/glow-box-link';
import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { contact, personal, socialLinks } from '../data/portfolio';

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

								<a
									href={`mailto:${personal.email}`}
									className='contact-email'
								>
									{personal.email}
								</a>

								<div className='contact-links'>
									{socialLinks.map((link) => (
										<GlowLink
											key={link.label}
											href={link.href}
											color={link.glowColor}
											icon={<link.icon color={link.iconColor} />}
											aria-label={link.label.toLowerCase()}
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
