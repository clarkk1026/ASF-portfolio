import { useEffect, useState } from 'react';

const SLIDES = [
	{
		id: 'landing',
		label: 'Landing',
		src: '/projects/sainni/landing.png',
		alt: 'SAINNI landing page — Build with SAINNI',
	},
	{
		id: 'chat',
		label: 'Chat',
		src: '/projects/sainni/chat.png',
		alt: 'SAINNI AI chat — refactor auth middleware',
	},
	{
		id: 'analytics',
		label: 'Analytics',
		src: '/projects/sainni/analytics.png',
		alt: 'SAINNI analytics dashboard',
	},
	{
		id: 'mobile-chat',
		label: 'Mobile chat',
		src: '/projects/sainni/mobile-chat.png',
		alt: 'SAINNI mobile chat — Postgres RLS',
	},
	{
		id: 'settings',
		label: 'Settings',
		src: '/projects/sainni/settings.png',
		alt: 'SAINNI mobile settings',
	},
] as const;

const INTERVAL_MS = 4500;

export const SainniScreenshotFlow = () => {
	const [active, setActive] = useState(0);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setActive((prev) => (prev + 1) % SLIDES.length);
		}, INTERVAL_MS);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div
			className='sainni-screenshot-flow'
			aria-label='SAINNI product screenshots'
		>
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
						loading={index === 0 ? 'eager' : 'lazy'}
						decoding='async'
						draggable={false}
					/>
				</div>
			))}

			<div
				className='sainni-flow-dots'
				aria-hidden='true'
			>
				{SLIDES.map((slide, index) => (
					<span
						key={slide.id}
						className={index === active ? 'is-active' : ''}
					/>
				))}
			</div>

			<span className='sainni-flow-caption'>{SLIDES[active].label}</span>
		</div>
	);
};
