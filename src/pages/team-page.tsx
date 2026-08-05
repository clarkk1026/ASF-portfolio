import { PageShell } from '../components/page-shell';
import { TeamSkyEffects } from '../components/team-sky-effects';
import { Team } from '../sections/team.section';

export const TeamPage = () => (
	<PageShell title='Team · ASF Studio'>
		<div
			className='team-night-sky'
			aria-hidden='true'
		>
			<span className='team-night-sky-image' />
			<span className='team-night-sky-nebula-light' />
			<span className='team-night-sky-moonlight' />
			<span className='team-night-sky-vignette' />
		</div>
		<TeamSkyEffects />
		<Team />
	</PageShell>
);
