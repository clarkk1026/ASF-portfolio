import { HomeStormBg } from '../components/home-storm-bg';
import { PageShell } from '../components/page-shell';
import { InfoSection } from '../sections/info.section';

export const HomePage = () => (
	<PageShell
		title='ASF Studio'
		home
		backdrop={<HomeStormBg />}
	>
		<InfoSection />
	</PageShell>
);
