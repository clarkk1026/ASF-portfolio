import { ExpertiseSkyBg } from '../components/expertise-sky-bg';
import { PageShell } from '../components/page-shell';
import { Expertise } from '../sections/expertise.section';

export const ExpertisePage = () => (
	<PageShell
		title='Expertise · ASF Studio'
		backdrop={<ExpertiseSkyBg />}
	>
		<Expertise />
	</PageShell>
);
