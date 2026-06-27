type TSectionTitleProps = {
	title: string;
	subTitle?: string;
	variant?: 'default' | 'side';
};

export const SectionTitle = ({
	title,
	subTitle,
	variant = 'default',
}: TSectionTitleProps) => {
	return (
		<div className={`title ${variant === 'side' ? 'title-side' : ''}`}>
			<p className='primary-text'>{title}</p>
			{subTitle && <p className='secondary-text'>{subTitle}</p>}
		</div>
	);
};
