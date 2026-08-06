import { HomeAuroraEffects } from './home-aurora-effects';

export const HomeAuroraBg = () => (
	<div
		className='home-aurora'
		aria-hidden='true'
	>
		<img
			className='home-aurora-image'
			src='/home-aurora-team-4k.webp'
			alt=''
			decoding='async'
			fetchPriority='high'
		/>
		<span className='home-aurora-veil' />
		<HomeAuroraEffects />
		<span className='home-aurora-shade' />
	</div>
);
