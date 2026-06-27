import { useEffect, useState } from 'react';

export const ScrollBar = () => {
	const [divHeight, setDivHeight] = useState<number>(0);

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
			setDivHeight(Math.min(scrollPercent, 98));
		};

		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<div
			className='scroll-bar'
			style={{ top: `${divHeight}%`, '--p': `${divHeight * 100}%` }}
		/>
	);
};
