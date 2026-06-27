import type { CSSProperties } from 'react';
import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { about, personal, traits } from '../data/portfolio';

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
								My Story
							</div>
							<span className='about-story-index'>01</span>
						</header>

						<div className='about-story-divider' />

						<div className='about-story-body'>
							<p>
								I enjoy building products that solve real business problems,
								combining <mark>AI</mark>, <mark>Shopify</mark>, and modern{' '}
								<mark>full-stack</mark> technologies. My journey has been shaped
								by overcoming personal challenges from an early age, adapting to
								new environments, and learning through real-world experience.
							</p>

							<div className='about-story-break'>
								<span />
								<span />
								<span />
							</div>

							<p>
								Alongside software engineering, I built and operated a small{' '}
								<mark>clothing business</mark>, which taught me the importance
								of execution, customer focus, and consistency. Today I focus on
								creating scalable applications, integrating AI into practical
								workflows, and turning ideas into reliable products that people
								actually use.
							</p>
						</div>

						<footer className='about-story-footer'>
							<span>{personal.location}</span>
							<span>Product Engineering Commerce</span>
						</footer>
					</article>
				</Reveal>

				<Reveal delay={260}>
					<div className='about-skills-block'>
						<div className='about-skills-heading'>
							<h3>Core Focus</h3>
							<p>What I bring to every project</p>
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
									<span className='trait-pill-icon'>◆</span>
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
