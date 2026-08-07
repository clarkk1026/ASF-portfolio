import { PageShell } from '../components/page-shell';
import { ProjectsSkyBg } from '../components/projects-sky-bg';
import { Projects } from '../sections/projects.section';

export const ProjectsPage = () => (
	<PageShell
		title='Projects · ASF Studio'
		backdrop={<ProjectsSkyBg />}
	>
		<Projects />
	</PageShell>
);
