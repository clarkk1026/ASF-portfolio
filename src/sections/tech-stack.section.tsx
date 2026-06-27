import { GlowBox } from '../components/glow-box';
import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { techStack } from '../data/portfolio';

export const TechStack = () => {
	return (
		<section
			className='tech-stack'
			id='tech-stack'
		>
			<div className='tech-stack-inner container'>
				<div className='tech-grid'>
					{techStack.groups.map((group, idx) => (
						<Reveal
							key={group.heading}
							delay={idx * 80}
						>
							<div className='tech-group glass-card'>
								<p className='tech-group-heading'>{group.heading}</p>
								<div className='tech-row'>
									{group.items.map((item) => (
										<GlowBox
											key={item.label}
											icon={<item.icon color={item.iconColor} />}
											color={item.glowColor}
											title={item.label}
										/>
									))}
								</div>
							</div>
						</Reveal>
					))}
				</div>

				<div className='section-sidebar tech-stack-title'>
					<LayeredSectionTitle
						primary={techStack.section.title}
						secondary={techStack.section.subtitle}
						summary={techStack.section.summary}
					/>
				</div>
			</div>
		</section>
	);
};
