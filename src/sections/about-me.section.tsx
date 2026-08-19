import type { CSSProperties } from 'react';
import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { about, traits } from '../data/portfolio';

export const AboutMe = () => {
	return (
		<section
			className='about-me container'
			id='about-me'
		>
			<div className='section-sidebar about-me-title'>
				<LayeredSectionTitle
					primary={about.section.title}
					secondary={about.section.subtitle}
					summary={about.section.summary}
				/>
			</div>

			<div className='about-me-content'>
				<Reveal delay={120}>
					<article className='about-story-card'>
						<div className='about-story-glow' aria-hidden='true' />

						<header className='about-story-header'>
							<div className='about-story-label'>
								<span className='about-story-dot' />
								Our Story
							</div>
						</header>

						<div className='about-story-body'>
							{about.intro.map((paragraph) => (
								<p key={paragraph.slice(0, 32)}>{paragraph}</p>
							))}
						</div>

						<footer className='about-story-footer'>
							<span>Remote team</span>
							<span>Founded 2024</span>
						</footer>
					</article>
				</Reveal>

				<Reveal delay={260}>
					<div className='about-skills-block'>
						<div className='about-skills-heading'>
							<h3>How We Work</h3>
							<p>What ASF brings to every engagement</p>
						</div>

						<div className='trait-grid'>
							{traits.map((trait, idx) => (
								<span
									className='trait-pill'
									key={trait}
									style={
										{ '--pill-delay': `${idx * 70}ms` } as CSSProperties
									}
								>
									{trait}
								</span>
							))}
						</div>
					</div>
				</Reveal>
			</div>
		</section>
	);
};
