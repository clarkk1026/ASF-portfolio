import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type PointerEvent as ReactPointerEvent,
} from 'react';
import { ProjectCardImage } from './project-card-image';
import { projects, type ProjectItem } from '../data/portfolio';

const SCROLL_SPEED = 0.55;
const MIN_THUMB_RATIO = 0.08;
const END_PAUSE_MS = 900;

type ProjectCardProps = {
	project: ProjectItem;
	index: number;
};

type ScrollMetrics = {
	maxScroll: number;
	trackWidth: number;
	thumbWidth: number;
	travel: number;
};

const ProjectCard = ({ project, index }: ProjectCardProps) => (
	<article
		className={`project-card glass-card ${project.featured ? 'project-card-featured' : ''}`}
		role='listitem'
	>
		<a
			className='project-card-link'
			href={project.url}
			target='_blank'
			rel='noopener noreferrer'
			aria-label={`Visit ${project.title} live site`}
			draggable={false}
		>
			<div className='project-image-wrap'>
				<ProjectCardImage
					src={project.image}
					alt={`${project.title} storefront preview`}
				/>
				<div className='project-image-overlay' />
				<div className='project-screen-name'>
					<span className='project-index'>
						{String(index + 1).padStart(2, '0')}
					</span>
					<h3>{project.title}</h3>
				</div>
				{project.featured ? (
					<span className='project-badge'>Featured</span>
				) : null}
				<span className='project-live-badge'>Live site</span>
			</div>
		</a>

		<div className='project-card-body'>
			<p>{project.description}</p>
			<div className='project-stack'>
				{project.stack.map((tech) => (
					<span key={tech}>{tech}</span>
				))}
			</div>
			<a
				className='project-visit-link'
				href={project.url}
				target='_blank'
				rel='noopener noreferrer'
				draggable={false}
			>
				Visit {project.title}
			</a>
		</div>
	</article>
);

export const ProjectsGallery = () => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const railRef = useRef<HTMLDivElement>(null);
	const thumbRef = useRef<HTMLDivElement>(null);
	const maxScrollRef = useRef(0);
	const pausedRef = useRef(false);
	const scrollbarDraggingRef = useRef(false);
	const autoCycleRef = useRef(false);
	const pointerOffsetInThumbRef = useRef(0);
	const cycleTimerRef = useRef<number | null>(null);
	const metricsRef = useRef<ScrollMetrics | null>(null);
	const [thumbHidden, setThumbHidden] = useState(false);

	const getMaxScroll = useCallback(() => {
		const scroll = scrollRef.current;
		if (!scroll) return 0;
		return Math.max(0, scroll.scrollWidth - scroll.clientWidth);
	}, []);

	const getMetrics = useCallback((): ScrollMetrics | null => {
		const scroll = scrollRef.current;
		const rail = railRef.current;
		const maxScroll = maxScrollRef.current;
		if (!scroll || !rail || maxScroll <= 0) return null;

		const trackWidth = rail.getBoundingClientRect().width;
		const scrollWidth = scroll.scrollWidth;
		const thumbWidth = Math.max(
			trackWidth * MIN_THUMB_RATIO,
			trackWidth * (scroll.clientWidth / scrollWidth),
		);
		const travel = Math.max(trackWidth - thumbWidth, 1);

		const metrics = { maxScroll, trackWidth, thumbWidth, travel };
		metricsRef.current = metrics;
		return metrics;
	}, []);

	const paintThumb = useCallback((leftPx: number, widthPx: number) => {
		const thumb = thumbRef.current;
		if (!thumb) return;
		thumb.style.width = `${widthPx}px`;
		thumb.style.transform = `translate3d(${leftPx}px, -50%, 0)`;
	}, []);

	const syncScrollbar = useCallback(() => {
		const scroll = scrollRef.current;
		const metrics = getMetrics();
		if (!scroll || !metrics) {
			paintThumb(0, 0);
			return;
		}

		const progress =
			metrics.maxScroll > 0 ? scroll.scrollLeft / metrics.maxScroll : 0;
		paintThumb(progress * metrics.travel, metrics.thumbWidth);
	}, [getMetrics, paintThumb]);

	const measureScroll = useCallback(() => {
		maxScrollRef.current = getMaxScroll();
		syncScrollbar();
	}, [getMaxScroll, syncScrollbar]);

	const setScrollFromThumbLeft = useCallback(
		(thumbLeftPx: number) => {
			const scroll = scrollRef.current;
			const metrics = getMetrics();
			if (!scroll || !metrics) return;

			const clamped = Math.min(metrics.travel, Math.max(0, thumbLeftPx));
			scroll.scrollLeft = (clamped / metrics.travel) * metrics.maxScroll;
			paintThumb(clamped, metrics.thumbWidth);
		},
		[getMetrics, paintThumb],
	);

	const clearCycleTimer = () => {
		if (cycleTimerRef.current !== null) {
			window.clearTimeout(cycleTimerRef.current);
			cycleTimerRef.current = null;
		}
	};

	const restartFromStart = useCallback(() => {
		const scroll = scrollRef.current;
		if (!scroll) return;

		setThumbHidden(true);
		autoCycleRef.current = true;

		clearCycleTimer();
		cycleTimerRef.current = window.setTimeout(() => {
			scroll.scrollLeft = 0;
			paintThumb(0, metricsRef.current?.thumbWidth ?? 0);
			setThumbHidden(false);
			autoCycleRef.current = false;
			pausedRef.current = false;
		}, END_PAUSE_MS);
	}, [paintThumb]);

	useEffect(() => {
		measureScroll();
		const track = trackRef.current;
		const observer =
			track && typeof ResizeObserver !== 'undefined'
				? new ResizeObserver(measureScroll)
				: null;
		if (track) observer?.observe(track);

		window.addEventListener('resize', measureScroll);
		window.addEventListener('load', measureScroll);

		const timers = [0, 300, 900].map((ms) =>
			window.setTimeout(measureScroll, ms),
		);

		return () => {
			observer?.disconnect();
			window.removeEventListener('resize', measureScroll);
			window.removeEventListener('load', measureScroll);
			timers.forEach((id) => window.clearTimeout(id));
			clearCycleTimer();
		};
	}, [measureScroll]);

	useEffect(() => {
		const scroll = scrollRef.current;
		if (!scroll) return;

		const onScroll = () => syncScrollbar();
		scroll.addEventListener('scroll', onScroll, { passive: true });
		return () => scroll.removeEventListener('scroll', onScroll);
	}, [syncScrollbar]);

	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		let frame = 0;
		const tick = () => {
			const scroll = scrollRef.current;
			const maxScroll = maxScrollRef.current;

			if (
				scroll &&
				!pausedRef.current &&
				!scrollbarDraggingRef.current &&
				!autoCycleRef.current &&
				maxScroll > 0
			) {
				if (scroll.scrollLeft >= maxScroll - 1) {
					pausedRef.current = true;
					restartFromStart();
				} else {
					scroll.scrollLeft = Math.min(
						maxScroll,
						scroll.scrollLeft + SCROLL_SPEED,
					);
					syncScrollbar();
				}
			}

			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [restartFromStart, syncScrollbar]);

	const onRailPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.button !== 0) return;
		event.preventDefault();

		const metrics = getMetrics();
		const rail = railRef.current;
		if (!metrics || !rail) return;

		clearCycleTimer();
		autoCycleRef.current = false;
		setThumbHidden(false);
		pausedRef.current = true;
		scrollbarDraggingRef.current = true;
		rail.setPointerCapture(event.pointerId);

		const rect = rail.getBoundingClientRect();
		const pointerX = event.clientX - rect.left;
		const isThumb = (event.target as HTMLElement).closest(
			'.projects-scroll-thumb',
		);

		const currentThumbLeft =
			metrics.maxScroll > 0
				? (scrollRef.current!.scrollLeft / metrics.maxScroll) *
					metrics.travel
				: 0;

		if (isThumb) {
			pointerOffsetInThumbRef.current = pointerX - currentThumbLeft;
		} else {
			pointerOffsetInThumbRef.current = metrics.thumbWidth / 2;
			setScrollFromThumbLeft(pointerX - pointerOffsetInThumbRef.current);
		}

		const onMove = (moveEvent: PointerEvent) => {
			moveEvent.preventDefault();
			const liveRect = rail.getBoundingClientRect();
			const thumbLeft =
				moveEvent.clientX -
				liveRect.left -
				pointerOffsetInThumbRef.current;
			setScrollFromThumbLeft(thumbLeft);
		};

		const onUp = (upEvent: PointerEvent) => {
			if (rail.hasPointerCapture(upEvent.pointerId)) {
				rail.releasePointerCapture(upEvent.pointerId);
			}
			rail.removeEventListener('pointermove', onMove);
			rail.removeEventListener('pointerup', onUp);
			rail.removeEventListener('pointercancel', onUp);
			scrollbarDraggingRef.current = false;
			pausedRef.current = false;
		};

		rail.addEventListener('pointermove', onMove);
		rail.addEventListener('pointerup', onUp);
		rail.addEventListener('pointercancel', onUp);
	};

	return (
		<div className='projects-gallery-wrap'>
			<div className='projects-gallery-viewport'>
				<div
					ref={scrollRef}
					className='projects-gallery'
					role='list'
					aria-label='Selected work gallery'
				>
					<div
						ref={trackRef}
						className='projects-gallery-track'
					>
						{projects.map((project, idx) => (
							<div
								key={project.title}
								className='projects-gallery-item'
							>
								<ProjectCard
									project={project}
									index={idx}
								/>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className='projects-scroll-rail'>
				<div
					ref={railRef}
					className='projects-scroll-track'
					role='scrollbar'
					aria-label='Gallery scroll position'
					aria-valuemin={0}
					aria-valuemax={100}
					onPointerDown={onRailPointerDown}
				>
					<div
						ref={thumbRef}
						className={`projects-scroll-thumb ${thumbHidden ? 'projects-scroll-thumb-hidden' : ''}`}
					/>
				</div>
			</div>
		</div>
	);
};
