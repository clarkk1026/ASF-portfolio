import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { experience } from '../data/portfolio';

export const WorkExperience = () => {
	return (
		<section
			className='experience container'
			id='experience'
		>
			<div className='section-sidebar experience-title'>
				<LayeredSectionTitle
					primary={experience.section.title}
					secondary={experience.section.subtitle}
					summary={experience.section.summary}
					longSecondary
				/>
			</div>

			<div className='experience-content'>
				{experience.timeline.map(({ items }, sectionIdx) => (
					<div
						className='timeline'
						key={sectionIdx}
					>
						{items.map(({ role, org, period, bullets }, itemIdx) => (
							<Reveal
								key={`${role}-${org}`}
								delay={120 + itemIdx * 100}
							>
								<div className='timeline-list'>
									<div className='timeline-item glass-card'>
										<div className='timeline-meta'>
											<p className='designation'>{role}</p>
											<p className='place'>
												{org}, {period}
											</p>
										</div>
										{bullets.length > 0 && (
											<div className='timeline-description'>
												<ul>
													{bullets.map((bullet) => (
														<li key={bullet}>{bullet}</li>
													))}
												</ul>
											</div>
										)}
									</div>
								</div>
							</Reveal>
						))}
					</div>
				))}
			</div>
		</section>
	);
};
