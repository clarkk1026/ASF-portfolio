import { useEffect, useMemo, useRef, useState } from 'react';
import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { experience } from '../data/portfolio';

const FOCUS_VIEWPORT_RATIO = 0.42;

type TimelineMetrics = {
	railTop: number;
	railHeight: number;
	progress: number;
	activeIndex: number;
};

const getAnchorY = (item: HTMLElement, timelineTop: number) => {
	const meta = item.querySelector('.timeline-meta');
	const target = meta ?? item;
	const rect = target.getBoundingClientRect();
	return rect.top - timelineTop + rect.height * 0.4;
};

const emptyMetrics: TimelineMetrics = {
	railTop: 0,
	railHeight: 0,
	progress: 0,
	activeIndex: 0,
};

export const WorkExperience = () => {
	const timelineRef = useRef<HTMLDivElement>(null);
	const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
	const [metrics, setMetrics] = useState<TimelineMetrics>(emptyMetrics);

	const allItems = useMemo(
		() =>
			experience.timeline.flatMap((section) =>
				section.items.map((item, index) => ({
					...item,
					sectionHeading: index === 0 ? section.heading : null,
				})),
			),
		[],
	);

	useEffect(() => {
		let frame = 0;

		const updateTimeline = () => {
			const timeline = timelineRef.current;
			const items = itemRefs.current.filter(Boolean) as HTMLDivElement[];
			if (!timeline || items.length === 0) return;

			const timelineRect = timeline.getBoundingClientRect();
			const anchors = items.map((item) => getAnchorY(item, timelineRect.top));

			const railTop = anchors[0];
			const railEnd = anchors[anchors.length - 1];
			const railHeight = Math.max(railEnd - railTop, 1);

			const scrollY = window.scrollY;
			const focusY = scrollY + window.innerHeight * FOCUS_VIEWPORT_RATIO;
			const railStartDoc = scrollY + timelineRect.top + railTop;
			const railEndDoc = scrollY + timelineRect.top + railEnd;

			const rawProgress =
				(focusY - railStartDoc) / Math.max(railEndDoc - railStartDoc, 1);
			const progress = Math.min(1, Math.max(0, rawProgress));

			const focusViewportY = window.innerHeight * FOCUS_VIEWPORT_RATIO;
			let activeIndex = 0;
			let closest = Infinity;

			items.forEach((_item, index) => {
				const anchorViewportY = timelineRect.top + anchors[index];
				const distance = Math.abs(anchorViewportY - focusViewportY);
				if (distance < closest) {
					closest = distance;
					activeIndex = index;
				}
			});

			setMetrics({ railTop, railHeight, progress, activeIndex });
		};

		const onScroll = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(updateTimeline);
		};

		updateTimeline();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);

		const timeline = timelineRef.current;
		const resizeObserver =
			timeline &&
			new ResizeObserver(() => {
				onScroll();
			});
		if (timeline && resizeObserver) resizeObserver.observe(timeline);

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			resizeObserver?.disconnect();
		};
	}, [allItems.length]);

	const dotOffset = metrics.railHeight * metrics.progress;

	return (
		<section
			className='experience container'
			id='experience'
		>
			<div className='section-sidebar experience-title'>
				<LayeredSectionTitle
					primary={experience.section.title}
					secondary={experience.section.subtitle}
					summary={experience.section.summary}
					longSecondary
				/>
			</div>

			<div className='experience-content'>
				<div
					className='timeline'
					ref={timelineRef}
				>
					{metrics.railHeight > 0 && (
						<div
							className='timeline-rail'
							aria-hidden='true'
							style={{
								top: `${metrics.railTop}px`,
								height: `${metrics.railHeight}px`,
							}}
						>
							<div className='timeline-rail-track' />
							<div
								className='timeline-rail-fill'
								style={{ height: `${dotOffset}px` }}
							/>
							<div
								className='timeline-dot'
								style={{ top: `${dotOffset}px` }}
							/>
						</div>
					)}

					{allItems.map(
						({ sectionHeading, role, org, period, bullets }, itemIdx) => (
						<Reveal
							key={`${role}-${org}`}
							delay={80 + itemIdx * 80}
						>
							<div
								className={`timeline-list ${metrics.activeIndex === itemIdx ? 'timeline-list-active' : ''}`}
								ref={(el) => {
									itemRefs.current[itemIdx] = el;
								}}
							>
								{sectionHeading ? (
									<h3 className='timeline-group-heading'>{sectionHeading}</h3>
								) : null}
								<div className='timeline-item glass-card'>
									<div className='timeline-meta'>
										<p className='designation'>{role}</p>
										<p className='place'>
											{org}, {period}
										</p>
									</div>
									{bullets.length > 0 && (
										<div className='timeline-description'>
											<ul>
												{bullets.map((bullet) => (
													<li key={bullet}>{bullet}</li>
												))}
											</ul>
										</div>
									)}
								</div>
							</div>
						</Reveal>
					),
					)}
				</div>
			</div>
		</section>
	);
};
