import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
	globeSectionCount,
	globeSectionIds,
	useGlobe,
	type GlobeSectionId,
} from '../lib/globe-context';

type GlobePanel = {
	id: GlobeSectionId;
	content: ReactNode;
	label: string;
};

type GlobeWorldProps = {
	panels: GlobePanel[];
};

const SEGMENT = 360 / globeSectionCount;
const INTRO_DURATION_MS = 8000;
const IDLE_SPEED = 0.01;
const DRAG_SENSITIVITY = 0.42;
const WHEEL_SENSITIVITY = 0.2;
const SNAP_MS = 680;
const EXPAND_IN_MS = 900;
const CONTRACT_MS = 420;
const STOP_DELAY_MS = 520;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutQuart = (t: number) =>
	t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

const normalizeIndex = (index: number) =>
	((index % globeSectionCount) + globeSectionCount) % globeSectionCount;

const normalizeAngle = (deg: number) => {
	let a = deg % 360;
	if (a > 180) a -= 360;
	if (a < -180) a += 360;
	return a;
};

const indexFromRotation = (rotation: number) =>
	normalizeIndex(Math.round(-rotation / SEGMENT));

const rotationForIndex = (index: number) => -index * SEGMENT;

const clamp = (v: number, min: number, max: number) =>
	Math.min(max, Math.max(min, v));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type PanelMetrics = {
	panelW: number;
	panelH: number;
	orbitR: number;
	fullScale: number;
};

const getMetrics = (): PanelMetrics => {
	const w = window.innerWidth;
	const h = window.innerHeight;
	const panelW = clamp(w * 0.24, 200, 320);
	const panelH = clamp(h * 0.2, 150, 240);
	const orbitR = clamp(Math.min(w, h) * 0.34, 260, 460);
	const fullScale = Math.min((w * 0.94) / panelW, (h * 0.9) / panelH);
	return { panelW, panelH, orbitR, fullScale };
};

const getPanelStyle = (
	panelIndex: number,
	rotation: number,
	metrics: PanelMetrics,
	expandProgress: number,
	isMoving: boolean,
) => {
	const relativeAngle = normalizeAngle(rotation + panelIndex * SEGMENT);
	const rad = (relativeAngle * Math.PI) / 180;
	const absAngle = Math.abs(relativeAngle);

	const orbitX = metrics.orbitR * Math.sin(rad);
	const orbitZ = metrics.orbitR * Math.cos(rad);
	const orbitRot = -relativeAngle;

	const frontness = Math.max(0, 1 - absAngle / (SEGMENT * 0.88));
	const isFront = absAngle < SEGMENT * 0.42;
	const expand = isFront ? expandProgress : 0;

	const scale = lerp(1, metrics.fullScale, easeOutCubic(expand));
	const tx = orbitX * (1 - expand);
	const tz = lerp(orbitZ, 120, easeOutCubic(expand));
	const rot = orbitRot * (1 - expand);

	const orbitOpacity =
		absAngle > SEGMENT * 1.45 ? 0 : 0.35 + frontness * 0.55;
	const opacity = lerp(orbitOpacity, 1, expand);
	const isActive = expand > 0.72;
	const isOrbiting = isMoving || expand < 0.08;

	return {
		transform: `translate3d(calc(-50% + ${tx}px), -50%, ${tz}px) rotateY(${rot}deg) scale(${scale})`,
		opacity,
		isActive,
		isOrbiting,
		zIndex: isActive ? 12 : Math.round(2 + frontness * 6),
	};
};

export const GlobeWorld = ({ panels }: GlobeWorldProps) => {
	const { registerRotateToIndex, setActiveIndex, setIntroComplete } =
		useGlobe();

	const viewportRef = useRef<HTMLDivElement>(null);
	const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
	const shellRefs = useRef<(HTMLDivElement | null)[]>([]);
	const rotationRef = useRef(0);
	const targetRef = useRef(0);
	const expandRef = useRef(0);
	const expandTargetRef = useRef(0);
	const expandAnimFromRef = useRef(0);
	const expandAnimStartRef = useRef(0);
	const expandAnimDurationRef = useRef(EXPAND_IN_MS);
	const introStartRef = useRef<number | null>(null);
	const introDoneRef = useRef(false);
	const draggingRef = useRef(false);
	const movingRef = useRef(false);
	const lastPointerXRef = useRef(0);
	const mouseXRef = useRef(0);
	const idleRef = useRef(true);
	const idleTimerRef = useRef(0);
	const stopTimerRef = useRef(0);
	const snapFromRef = useRef(0);
	const snapStartRef = useRef(0);
	const snapTargetRef = useRef<number | null>(null);
	const rafRef = useRef(0);
	const metricsRef = useRef(getMetrics());
	const lastActiveRef = useRef(0);

	const [introRunning, setIntroRunning] = useState(true);
	const [viewportClass, setViewportClass] = useState('globe-viewport');

	const setExpandTarget = (value: number, duration = EXPAND_IN_MS) => {
		expandTargetRef.current = clamp(value, 0, 1);
		expandAnimFromRef.current = expandRef.current;
		expandAnimStartRef.current = performance.now();
		expandAnimDurationRef.current = duration;
	};

	const applyPanelTransforms = (
		rotation: number,
		expandProgress: number,
		isMoving: boolean,
	) => {
		const metrics = metricsRef.current;
		for (let i = 0; i < panels.length; i++) {
			const el = panelRefs.current[i];
			const shell = shellRefs.current[i];
			if (!el || !shell) continue;

			const style = getPanelStyle(
				i,
				rotation,
				metrics,
				expandProgress,
				isMoving,
			);

			el.style.transform = style.transform;
			el.style.opacity = String(style.opacity);
			el.style.zIndex = String(style.zIndex);
			el.classList.toggle('globe-panel-active', style.isActive);
			el.classList.toggle('globe-panel-orbiting', style.isOrbiting);
			shell.classList.toggle('globe-panel-shell-expanded', style.isActive);
		}
	};

	const startSnap = (target: number) => {
		snapFromRef.current = rotationRef.current;
		snapTargetRef.current = target;
		snapStartRef.current = performance.now();
		movingRef.current = true;
		setExpandTarget(0, CONTRACT_MS);
	};

	const snapToIndex = (index: number) => {
		introDoneRef.current = true;
		setIntroRunning(false);
		setIntroComplete(true);
		startSnap(rotationForIndex(normalizeIndex(index)));
		window.clearTimeout(stopTimerRef.current);
		stopTimerRef.current = window.setTimeout(() => {
			movingRef.current = false;
			setExpandTarget(1, EXPAND_IN_MS);
		}, SNAP_MS + STOP_DELAY_MS);
	};

	useEffect(() => {
		registerRotateToIndex(snapToIndex);

		const hash = window.location.hash.replace(/^#/, '');
		const hashIndex = globeSectionIds.indexOf(hash as GlobeSectionId);
		if (hashIndex >= 0) {
			const next = rotationForIndex(hashIndex);
			rotationRef.current = next;
			targetRef.current = next;
			introDoneRef.current = true;
			expandRef.current = 1;
			expandTargetRef.current = 1;
			setIntroRunning(false);
			setIntroComplete(true);
		}
	}, [registerRotateToIndex, setIntroComplete, panels.length]);

	useEffect(() => {
		const updateMetrics = () => {
			metricsRef.current = getMetrics();
		};
		updateMetrics();
		window.addEventListener('resize', updateMetrics);
		return () => window.removeEventListener('resize', updateMetrics);
	}, []);

	useEffect(() => {
		let lastTime = performance.now();

		const tick = (timestamp: number) => {
			const deltaMs = Math.min(timestamp - lastTime, 32);
			lastTime = timestamp;

			if (!introDoneRef.current) {
				if (introStartRef.current === null) introStartRef.current = timestamp;
				const elapsed = timestamp - introStartRef.current;
				const progress = Math.min(elapsed / INTRO_DURATION_MS, 1);
				const eased = easeInOutQuart(progress);
				rotationRef.current = -360 * eased;
				expandRef.current = 0;
				expandTargetRef.current = 0;

				if (progress >= 1) {
					introDoneRef.current = true;
					rotationRef.current = 0;
					targetRef.current = 0;
					setIntroRunning(false);
					setIntroComplete(true);
					setExpandTarget(1, EXPAND_IN_MS);
				}
			} else if (snapTargetRef.current !== null) {
				const t = Math.min((timestamp - snapStartRef.current) / SNAP_MS, 1);
				const eased = easeInOutQuart(t);
				rotationRef.current =
					snapFromRef.current +
					(snapTargetRef.current - snapFromRef.current) * eased;
				if (t >= 1) {
					rotationRef.current = snapTargetRef.current;
					targetRef.current = rotationRef.current;
					snapTargetRef.current = null;
					window.clearTimeout(stopTimerRef.current);
					stopTimerRef.current = window.setTimeout(() => {
						if (snapTargetRef.current !== null || draggingRef.current) return;
						movingRef.current = false;
						expandTargetRef.current = 1;
						expandAnimFromRef.current = expandRef.current;
						expandAnimStartRef.current = performance.now();
						expandAnimDurationRef.current = EXPAND_IN_MS;
					}, STOP_DELAY_MS);
				}
			} else if (draggingRef.current) {
				rotationRef.current = targetRef.current;
			} else if (idleRef.current && expandRef.current < 0.15) {
				targetRef.current -= IDLE_SPEED * (deltaMs / 16.67);
				targetRef.current += mouseXRef.current * 0.06;
				const stiffness = 1 - Math.pow(0.0008, deltaMs / 16.67);
				rotationRef.current +=
					(targetRef.current - rotationRef.current) * stiffness;
			} else {
				const stiffness = 1 - Math.pow(0.0006, deltaMs / 16.67);
				rotationRef.current +=
					(targetRef.current - rotationRef.current) * stiffness;
			}

			const expandElapsed = timestamp - expandAnimStartRef.current;
			const expandT = clamp(
				expandElapsed / expandAnimDurationRef.current,
				0,
				1,
			);
			expandRef.current = lerp(
				expandAnimFromRef.current,
				expandTargetRef.current,
				easeOutCubic(expandT),
			);

			const isMoving =
				movingRef.current ||
				draggingRef.current ||
				snapTargetRef.current !== null ||
				Math.abs(targetRef.current - rotationRef.current) > 0.35;

			if (isMoving && expandTargetRef.current > 0) {
				setExpandTarget(0, CONTRACT_MS);
			}

			const expanded = expandRef.current > 0.65;
			setViewportClass(
				`globe-viewport${expanded ? ' globe-viewport-expanded' : ' globe-viewport-orbiting'}`,
			);

			applyPanelTransforms(rotationRef.current, expandRef.current, isMoving);

			const active = indexFromRotation(rotationRef.current);
			if (active !== lastActiveRef.current) {
				lastActiveRef.current = active;
				setActiveIndex(active);
				if (
					introDoneRef.current &&
					snapTargetRef.current === null &&
					expandRef.current > 0.5
				) {
					window.history.replaceState(
						null,
						'',
						`#${globeSectionIds[active]}`,
					);
				}
			}

			rafRef.current = requestAnimationFrame(tick);
		};

		rafRef.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafRef.current);
	}, [panels.length, setActiveIndex, setIntroComplete]);

	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) return;

		const onMouseMove = (event: MouseEvent) => {
			mouseXRef.current = (event.clientX / window.innerWidth - 0.5) * 2;
		};

		const onWheel = (event: WheelEvent) => {
			if (!introDoneRef.current) return;
			if (expandRef.current > 0.65) {
				const panelInner = (event.target as HTMLElement).closest(
					'.globe-panel-inner',
				);
				if (
					panelInner &&
					panelInner.scrollHeight > panelInner.clientHeight + 4
				) {
					return;
				}
			}

			event.preventDefault();
			movingRef.current = true;
			idleRef.current = false;
			snapTargetRef.current = null;
			setExpandTarget(0, CONTRACT_MS);
			targetRef.current += event.deltaY * WHEEL_SENSITIVITY;

			window.clearTimeout(idleTimerRef.current);
			idleTimerRef.current = window.setTimeout(() => {
				idleRef.current = true;
				startSnap(rotationForIndex(indexFromRotation(targetRef.current)));
			}, 640);
		};

		const onPointerDown = (event: PointerEvent) => {
			if (!introDoneRef.current) return;
			const target = event.target as HTMLElement;
			if (target.closest('.ai-bot-interactive')) return;
			if (expandRef.current > 0.65 && target.closest('.globe-panel-inner')) {
				return;
			}
			if (target.closest('a, button, input, textarea, select')) return;

			draggingRef.current = true;
			movingRef.current = true;
			snapTargetRef.current = null;
			idleRef.current = false;
			setExpandTarget(0, CONTRACT_MS);
			lastPointerXRef.current = event.clientX;
			viewport.setPointerCapture(event.pointerId);
		};

		const onPointerMove = (event: PointerEvent) => {
			mouseXRef.current = (event.clientX / window.innerWidth - 0.5) * 2;

			if (!draggingRef.current) return;
			const dx = event.clientX - lastPointerXRef.current;
			lastPointerXRef.current = event.clientX;
			targetRef.current += dx * DRAG_SENSITIVITY;
			rotationRef.current = targetRef.current;
		};

		const onPointerUp = (event: PointerEvent) => {
			if (!draggingRef.current) return;
			draggingRef.current = false;
			viewport.releasePointerCapture(event.pointerId);
			startSnap(rotationForIndex(indexFromRotation(targetRef.current)));
			window.setTimeout(() => {
				idleRef.current = true;
			}, 1200);
		};

		window.addEventListener('mousemove', onMouseMove, { passive: true });
		viewport.addEventListener('wheel', onWheel, { passive: false });
		viewport.addEventListener('pointerdown', onPointerDown);
		viewport.addEventListener('pointermove', onPointerMove);
		viewport.addEventListener('pointerup', onPointerUp);
		viewport.addEventListener('pointercancel', onPointerUp);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			viewport.removeEventListener('wheel', onWheel);
			viewport.removeEventListener('pointerdown', onPointerDown);
			viewport.removeEventListener('pointermove', onPointerMove);
			viewport.removeEventListener('pointerup', onPointerUp);
			viewport.removeEventListener('pointercancel', onPointerUp);
			window.clearTimeout(idleTimerRef.current);
			window.clearTimeout(stopTimerRef.current);
		};
	}, []);

	return (
		<div
			className={viewportClass}
			ref={viewportRef}
		>
			<div className='globe-scene'>
				<div
					className='globe-core'
					aria-hidden='true'
				>
					<div className='globe-core-glow' />
					<div className='globe-core-sphere' />
					<div className='globe-core-ring globe-core-ring-1' />
					<div className='globe-core-ring globe-core-ring-2' />
					<div className='globe-core-ring globe-core-ring-3' />
				</div>

				<div className='globe-stage'>
					{panels.map((panel, index) => (
						<div
							key={panel.id}
							ref={(node) => {
								panelRefs.current[index] = node;
							}}
							className='globe-panel'
							data-label={panel.label}
						>
							<div
								ref={(node) => {
									shellRefs.current[index] = node;
								}}
								className='globe-panel-shell'
							>
								<span className='globe-panel-chip'>{panel.label}</span>
								<div className='globe-panel-inner'>{panel.content}</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<p
				className='globe-hint'
				aria-hidden='true'
			>
				{introRunning
					? 'Sections orbiting the core…'
					: 'Drag to orbit · release to expand'}
			</p>
		</div>
	);
};
