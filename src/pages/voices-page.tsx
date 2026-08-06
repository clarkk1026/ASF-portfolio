import { PageShell } from '../components/page-shell';
import { PageSkyBg } from '../components/page-sky-bg';
import { VisitorNote } from '../sections/visitor-note.section';

export const VoicesPage = () => (
	<PageShell
		title='Voices · ASF Studio'
		backdrop={<PageSkyBg variant='voices' />}
	>
		<VisitorNote />
	</PageShell>
);
