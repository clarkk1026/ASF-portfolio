import { PageShell } from '../components/page-shell';
import { PageSkyBg } from '../components/page-sky-bg';
import { AboutMe } from '../sections/about-me.section';

export const AboutPage = () => (
	<PageShell
		title='About Us · ASF Studio'
		backdrop={<PageSkyBg variant='about' />}
	>
		<AboutMe />
	</PageShell>
);
