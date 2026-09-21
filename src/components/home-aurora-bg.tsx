import { HomeAuroraEffects } from './home-aurora-effects';

export const HomeAuroraBg = () => (
	<div
		className='home-aurora'
		aria-hidden='true'
	>
		<img
			className='home-aurora-image'
			src='/home-aurora-4k.webp?v=clean-solo-2026'
			alt=''
			decoding='async'
			fetchPriority='high'
		/>
		<span className='home-aurora-veil' />
		<HomeAuroraEffects />
		<span className='home-aurora-shade' />
	</div>
);
