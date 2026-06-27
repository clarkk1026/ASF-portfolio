import { useGlobe, globeSectionCount } from '../lib/globe-context';

export const ScrollBar = () => {
	const { activeIndex } = useGlobe();
	const progress =
		globeSectionCount > 1
			? (activeIndex / (globeSectionCount - 1)) * 100
			: 0;

	return (
		<div
			className='scroll-bar'
			style={{ top: `${Math.min(progress, 98)}%`, '--p': `${progress * 100}%` }}
		/>
	);
};
