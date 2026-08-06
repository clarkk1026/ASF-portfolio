import { PageShell } from '../components/page-shell';
import { PageSkyBg } from '../components/page-sky-bg';
import { Projects } from '../sections/projects.section';

export const ProjectsPage = () => (
	<PageShell
		title='Projects · ASF Studio'
		backdrop={<PageSkyBg variant='projects' />}
	>
		<Projects />
	</PageShell>
);
