import { useId, type CSSProperties } from 'react';

type LayeredSectionTitleProps = {
	primary: string;
	secondary: string;
	summary?: string;
	align?: 'left' | 'right' | 'center';
	longSecondary?: boolean;
};

const getSecondarySize = (secondary: string, longSecondary?: boolean) => {
	if (longSecondary || secondary.includes(' ') || secondary.length > 9) {
		return 'layered-title-long';
	}
	if (secondary.length <= 4) {
		return 'layered-title-short';
	}
	return 'layered-title-medium';
};

const splitChars = (text: string) =>
	Array.from(text).map((char, index) => (
		<span
			key={`${char}-${index}`}
			className='layered-title-char'
			style={{ '--char-i': index } as CSSProperties}
		>
			{char === ' ' ? '\u00A0' : char}
		</span>
	));

export const LayeredSectionTitle = ({
	primary,
	secondary,
	summary,
	align = 'left',
	longSecondary = false,
}: LayeredSectionTitleProps) => {
	const sizeClass = getSecondarySize(secondary, longSecondary);
	const uid = useId();

	return (
		<div
			className={`layered-title layered-title-${align} layered-title-animate ${sizeClass}`}
			style={{ '--title-uid': `"${uid}"` } as CSSProperties}
		>
			<svg
				className='layered-title-orbit'
				viewBox='0 0 320 180'
				aria-hidden='true'
			>
				<path
					className='layered-title-orbit-path'
					d='M28 148 C 58 96, 86 72, 118 58'
				/>
				<path
					className='layered-title-orbit-path layered-title-orbit-path-b'
					d='M168 86 C 210 72, 248 58, 292 42'
				/>
				<circle
					className='layered-title-orbit-dot'
					cx='28'
					cy='148'
					r='2.4'
				/>
				<circle
					className='layered-title-orbit-dot layered-title-orbit-dot-b'
					cx='118'
					cy='58'
					r='2'
				/>
				<circle
					className='layered-title-orbit-dot layered-title-orbit-dot-c'
					cx='292'
					cy='42'
					r='1.6'
				/>
			</svg>

			<div className='layered-title-heading'>
				<p className='layered-title-primary'>{splitChars(primary)}</p>

				<div className='layered-title-secondary-wrap'>
					<span className='layered-title-secondary-base'>
						{splitChars(secondary)}
					</span>
					<span
						className='layered-title-secondary-comet'
						aria-hidden='true'
					>
						{secondary}
					</span>
				</div>
			</div>

			{summary ? (
				<p className='layered-title-summary'>{summary}</p>
			) : null}
		</div>
	);
};
