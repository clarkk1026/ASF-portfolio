import { HomeAuroraBg } from '../components/home-aurora-bg';
import { PageShell } from '../components/page-shell';
import { InfoSection } from '../sections/info.section';

export const HomePage = () => (
	<PageShell
		title='Ben Clark'
		home
		backdrop={<HomeAuroraBg />}
	>
		<InfoSection />
	</PageShell>
);
