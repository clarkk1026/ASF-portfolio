import type { CSSProperties } from 'react';
import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { expertise, expertiseSection } from '../data/portfolio';

export const Expertise = () => {
	return (
		<section
			className='expertise container'
			id='expertise'
		>
			<div className='section-sidebar expertise-title'>
				<LayeredSectionTitle
					primary={expertiseSection.section.title}
					secondary={expertiseSection.section.subtitle}
					summary={expertiseSection.section.summary}
				/>
			</div>

			<div className='expertise-content'>
				<div className='expertise-grid'>
					{expertise.map((item, idx) => (
						<Reveal
							key={item.title}
							delay={idx * 100}
						>
							<article className='expertise-card glass-card'>
								<div
									className='expertise-icon'
									style={
										{
											'--glow': item.glowColor,
										} as CSSProperties
									}
								>
									<item.icon color={item.iconColor} />
								</div>
								<h3>{item.title}</h3>
								<p>{item.description}</p>
								<div className='expertise-tags'>
									{item.tags.map((tag) => (
										<span key={tag}>{tag}</span>
									))}
								</div>
							</article>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
};
