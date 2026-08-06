import { PageShell } from '../components/page-shell';
import { WorkExperience } from '../sections/experience.section';

export const PathPage = () => (
	<PageShell
		title='Path · ASF Studio'
		backdrop={
			<div
				className='path-night-sky'
				aria-hidden='true'
			>
				<span className='path-night-sky-image' />
				<span className='path-night-sky-milky-light' />
				<span className='path-night-sky-clouds' />
				<span className='path-night-sky-stars' />
				<span className='path-night-sky-moonlight' />
				<span className='path-night-sky-shade' />
			</div>
		}
	>
		<WorkExperience />
	</PageShell>
);
