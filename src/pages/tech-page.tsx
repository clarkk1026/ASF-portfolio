import { PageShell } from '../components/page-shell';
import { PageSkyBg } from '../components/page-sky-bg';
import { TechStack } from '../sections/tech-stack.section';

export const TechPage = () => (
	<PageShell
		title='Tech · ASF Studio'
		backdrop={<PageSkyBg variant='tech' />}
	>
		<TechStack />
	</PageShell>
);
