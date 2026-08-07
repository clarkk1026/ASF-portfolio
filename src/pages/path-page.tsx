import { PageShell } from '../components/page-shell';
import { SkyTwinkles } from '../components/sky-twinkles';
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
				<span className='path-night-sky-clouds' />
				<span className='path-night-sky-stars' />
				<SkyTwinkles
					density={95}
					skyBand={0.5}
				/>
				<span className='path-night-sky-shade' />
			</div>
		}
	>
		<WorkExperience />
	</PageShell>
);
