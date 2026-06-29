import { useEffect, useMemo, useState } from 'react';
import '../styles/cosmic-clock.css';

const STAR_ANGLES = [12, 38, 64, 95, 128, 162, 198, 232, 268, 302, 328, 352];

const formatDigitalTime = (date: Date) =>
	new Intl.DateTimeFormat(undefined, {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(date);

const formatDateLabel = (date: Date) =>
	new Intl.DateTimeFormat(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	}).format(date);

export const CosmicClock = () => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		let frame = 0;
		const tick = () => {
			setNow(new Date());
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, []);

	const parts = useMemo(() => {
		const hours = now.getHours() % 12;
		const minutes = now.getMinutes();
		const seconds = now.getSeconds() + now.getMilliseconds() / 1000;

		return {
			hourAngle: hours * 30 + minutes * 0.5,
			minuteAngle: minutes * 6 + seconds * 0.1,
			secondAngle: seconds * 6,
			digital: formatDigitalTime(now),
			dateLabel: formatDateLabel(now),
		};
	}, [now]);

	const [hoursText, minutesText] = parts.digital.split(':');

	return (
		<aside
			className='cosmic-clock'
			aria-label='Your local time'
		>
			<div
				className='cosmic-clock-sky'
				aria-hidden='true'
			>
				{STAR_ANGLES.map((angle, index) => (
					<span
						key={angle}
						className='cosmic-clock-star'
						style={{
							['--star-angle' as string]: `${angle}deg`,
							['--star-delay' as string]: `${index * 0.42}s`,
							['--star-size' as string]: index % 3 === 0 ? '2px' : '1.5px',
						}}
					/>
				))}
			</div>

			<div
				className='cosmic-clock-nebula'
				aria-hidden='true'
			>
				<span className='cosmic-clock-nebula-orb cosmic-clock-nebula-cyan' />
				<span className='cosmic-clock-nebula-orb cosmic-clock-nebula-violet' />
			</div>

			<div
				className='cosmic-clock-rim'
				aria-hidden='true'
			/>

			<div
				className='cosmic-clock-orbit'
				aria-hidden='true'
			>
				<span className='cosmic-clock-orbit-ring cosmic-clock-orbit-ring-outer' />
				<span className='cosmic-clock-orbit-ring cosmic-clock-orbit-ring-inner' />
				<span className='cosmic-clock-orbit-comet' />
			</div>

			<svg
				className='cosmic-clock-face'
				viewBox='0 0 120 120'
				role='img'
				aria-hidden='true'
			>
				<defs>
					<radialGradient
						id='cosmic-clock-void'
						cx='50%'
						cy='46%'
						r='58%'
					>
						<stop
							offset='0%'
							stopColor='rgba(0, 0, 0, 0.2)'
						/>
						<stop
							offset='55%'
							stopColor='rgba(0, 0, 0, 0.72)'
						/>
						<stop
							offset='100%'
							stopColor='rgba(0, 0, 0, 0.95)'
						/>
					</radialGradient>
					<radialGradient
						id='cosmic-clock-horizon'
						cx='50%'
						cy='50%'
						r='50%'
					>
						<stop
							offset='72%'
							stopColor='rgba(31, 195, 255, 0)'
						/>
						<stop
							offset='88%'
							stopColor='rgba(31, 195, 255, 0.14)'
						/>
						<stop
							offset='100%'
							stopColor='rgba(120, 160, 255, 0.28)'
						/>
					</radialGradient>
					<linearGradient
						id='cosmic-second-trail'
						x1='0%'
						y1='0%'
						x2='100%'
						y2='0%'
					>
						<stop
							offset='0%'
							stopColor='rgba(31, 195, 255, 0)'
						/>
						<stop
							offset='50%'
							stopColor='rgba(31, 195, 255, 0.35)'
						/>
						<stop
							offset='100%'
							stopColor='rgba(160, 220, 255, 1)'
						/>
					</linearGradient>
					<filter id='cosmic-clock-glow'>
						<feGaussianBlur
							stdDeviation='1.4'
							result='blur'
						/>
						<feMerge>
							<feMergeNode in='blur' />
							<feMergeNode in='SourceGraphic' />
						</feMerge>
					</filter>
				</defs>

				<circle
					cx='60'
					cy='60'
					r='54'
					className='cosmic-clock-face-bg'
				/>
				<circle
					cx='60'
					cy='60'
					r='54'
					fill='url(#cosmic-clock-void)'
				/>
				<circle
					cx='60'
					cy='60'
					r='54'
					fill='url(#cosmic-clock-horizon)'
				/>

				{[
					[22, 28, 0.55],
					[38, 18, 0.4],
					[74, 24, 0.5],
					[88, 44, 0.35],
					[82, 72, 0.45],
					[54, 86, 0.38],
					[28, 74, 0.42],
					[18, 48, 0.32],
				].map(([x, y, opacity], index) => (
					<circle
						key={index}
						cx={x}
						cy={y}
						r={index % 2 === 0 ? 0.65 : 0.45}
						className='cosmic-clock-face-star'
						opacity={opacity}
					/>
				))}

				<circle
					cx='60'
					cy='60'
					r='52'
					className='cosmic-clock-face-ring'
				/>
				<circle
					cx='60'
					cy='60'
					r='48'
					className='cosmic-clock-face-ring-inner'
				/>

				{Array.from({ length: 12 }, (_, index) => {
					const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
					const outer = 47;
					const inner = index % 3 === 0 ? 40 : 43.5;
					const x1 = 60 + Math.cos(angle) * inner;
					const y1 = 60 + Math.sin(angle) * inner;
					const x2 = 60 + Math.cos(angle) * outer;
					const y2 = 60 + Math.sin(angle) * outer;

					return (
						<line
							key={index}
							x1={x1}
							y1={y1}
							x2={x2}
							y2={y2}
							className={
								index % 3 === 0
									? 'cosmic-clock-tick cosmic-clock-tick-major'
									: 'cosmic-clock-tick'
							}
						/>
					);
					})}

				<g transform={`rotate(${parts.hourAngle} 60 60)`}>
					<line
						x1='60'
						y1='60'
						x2='60'
						y2='35'
						className='cosmic-clock-hand cosmic-clock-hand-hour'
					/>
				</g>

				<g transform={`rotate(${parts.minuteAngle} 60 60)`}>
					<line
						x1='60'
						y1='60'
						x2='60'
						y2='25'
						className='cosmic-clock-hand cosmic-clock-hand-minute'
					/>
				</g>

				<g
					transform={`rotate(${parts.secondAngle} 60 60)`}
					filter='url(#cosmic-clock-glow)'
				>
					<line
						x1='60'
						y1='70'
						x2='60'
						y2='19'
						className='cosmic-clock-hand cosmic-clock-hand-second-trail'
						stroke='url(#cosmic-second-trail)'
					/>
					<line
						x1='60'
						y1='66'
						x2='60'
						y2='19'
						className='cosmic-clock-hand cosmic-clock-hand-second'
					/>
				</g>

				<circle
					cx='60'
					cy='60'
					r='3.2'
					className='cosmic-clock-hand-cap'
				/>
				<circle
					cx='60'
					cy='60'
					r='1.6'
					className='cosmic-clock-center'
				/>
			</svg>

			<div className='cosmic-clock-readout'>
				<p className='cosmic-clock-digital'>
					<span>{hoursText}</span>
					<span className='cosmic-clock-colon'>:</span>
					<span>{minutesText}</span>
				</p>
				<p className='cosmic-clock-meta'>{parts.dateLabel}</p>
			</div>
		</aside>
	);
};
