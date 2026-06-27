import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { projects, projectsSection } from '../data/portfolio';

export const Projects = () => {
	return (
		<section
			className='projects container'
			id='projects'
		>
			<div className='section-sidebar projects-title'>
				<LayeredSectionTitle
					primary={projectsSection.section.title}
					secondary={projectsSection.section.subtitle}
					summary={projectsSection.section.summary}
				/>
			</div>

			<div className='projects-grid'>
				{projects.map((project, idx) => (
					<Reveal
						key={project.title}
						delay={idx * 120}
					>
						<article
							className={`project-card glass-card ${project.featured ? 'project-card-featured' : ''}`}
						>
							<div className='project-image-wrap'>
								<img
									src={project.image}
									alt={project.title}
									className='project-image'
									loading='lazy'
								/>
								<div className='project-image-overlay' />
								<div className='project-screen-name'>
									<span className='project-index'>
										{String(idx + 1).padStart(2, '0')}
									</span>
									<h3>{project.title}</h3>
								</div>
								{project.featured && (
									<span className='project-badge'>Featured</span>
								)}
							</div>

							<div className='project-card-body'>
								<p>{project.description}</p>
								<div className='project-stack'>
									{project.stack.map((tech) => (
										<span key={tech}>{tech}</span>
									))}
								</div>
							</div>
						</article>
					</Reveal>
				))}
			</div>
		</section>
	);
};
