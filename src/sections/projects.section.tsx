import { LayeredSectionTitle } from '../components/layered-section-title';
import { ProjectsGallery } from '../components/projects-gallery';
import { projectsSection } from '../data/portfolio';

export const Projects = () => {
	return (
		<section
			className='projects container'
			id='projects'
		>
			<div className='projects-header'>
				<LayeredSectionTitle
					primary={projectsSection.section.title}
					secondary={projectsSection.section.subtitle}
					summary={projectsSection.section.summary}
					align='center'
				/>
			</div>

			<ProjectsGallery />
		</section>
	);
};
