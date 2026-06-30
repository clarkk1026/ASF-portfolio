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

export const LayeredSectionTitle = ({
	primary,
	secondary,
	summary,
	align = 'right',
	longSecondary = false,
}: LayeredSectionTitleProps) => {
	const sizeClass = getSecondarySize(secondary, longSecondary);

	return (
		<div className={`layered-title layered-title-${align} ${sizeClass}`}>
			<div className='layered-title-heading'>
				<p className='layered-title-primary'>{primary}</p>

				<div className='layered-title-secondary-wrap'>
					<span className='layered-title-secondary-base'>{secondary}</span>
					<span
						className='layered-title-secondary-comet'
						aria-hidden='true'
					>
						{secondary}
					</span>
				</div>
			</div>

			{summary && <p className='layered-title-summary'>{summary}</p>}
		</div>
	);
};
