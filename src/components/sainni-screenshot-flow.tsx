import { useEffect, useState } from 'react';
import { SainniBrandLogo } from './sainni-brand-logo';
const SLIDES = [
	{
		id: 'landing',
		src: '/projects/sainni/landing.png',
		alt: 'SAINNI landing page, ship AI features faster',
	},
	{
		id: 'chat-ai',
		src: '/projects/sainni/chat-ai.png',
		alt: 'SAINNI AI chat with Python CSV assistant',
	},
	{
		id: 'chat',
		src: '/projects/sainni/chat.png',
		alt: 'SAINNI chat refactor auth middleware',
	},
	{
		id: 'analytics',
		src: '/projects/sainni/analytics.png',
		alt: 'SAINNI analytics dashboard',
	},
	{
		id: 'pricing',
		src: '/projects/sainni/pricing.png',
		alt: 'SAINNI pricing page',
	},
] as const;

const INTERVAL_MS = 5000;

export const SainniScreenshotFlow = () => {
	const [active, setActive] = useState(0);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setActive((prev) => (prev + 1) % SLIDES.length);
		}, INTERVAL_MS);
		return () => window.clearInterval(timer);
	}, []);

	useEffect(() => {
		for (const slide of SLIDES) {
			const img = new Image();
			img.src = slide.src;
		}
	}, []);

	return (
		<div
			className='sainni-screenshot-flow'
			aria-label='SAINNI product screenshots'
		>
			<div
				className='sainni-brand-overlay'
				aria-hidden
			>
				<SainniBrandLogo className='sainni-brand-logo' />
			</div>
			{SLIDES.map((slide, index) => (
				<div
					key={slide.id}
					className={`sainni-flow-slide${index === active ? ' is-active' : ''}`}
					aria-hidden={index !== active}
				>
					<img
						src={slide.src}
						alt={slide.alt}
						className='sainni-flow-image'
						loading={index <= 1 ? 'eager' : 'lazy'}
						decoding='sync'
						fetchPriority={index === 0 ? 'high' : 'auto'}
						draggable={false}
					/>
				</div>
			))}
		</div>
	);
};
