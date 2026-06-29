import { LayeredSectionTitle } from '../components/layered-section-title';
import { ProjectCardImage } from '../components/project-card-image';
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
							<a
								className='project-card-link'
								href={project.url}
								target='_blank'
								rel='noopener noreferrer'
								aria-label={`Visit ${project.title} live site`}
							>
								<div className='project-image-wrap'>
									<ProjectCardImage
										src={project.image}
										alt={`${project.title} storefront preview`}
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
									<span className='project-live-badge'>Live site</span>
								</div>
							</a>

							<div className='project-card-body'>
								<p>{project.description}</p>
								<div className='project-stack'>
									{project.stack.map((tech) => (
										<span key={tech}>{tech}</span>
									))}
								</div>
								<a
									className='project-visit-link'
									href={project.url}
									target='_blank'
									rel='noopener noreferrer'
								>
									Visit {project.title}
								</a>
							</div>
						</article>
					</Reveal>
				))}
			</div>
		</section>
	);
};
