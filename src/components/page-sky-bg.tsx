const PAGE_SKY_SRC = {
	about: '/about-night-sky-4k.webp',
	expertise: '/expertise-night-sky-4k.webp',
	projects: '/projects-night-sky-4k.webp',
	tech: '/tech-night-sky-4k.webp',
	voices: '/voices-night-sky-4k.webp',
} as const;

export type PageSkyVariant = keyof typeof PAGE_SKY_SRC;

type PageSkyBgProps = {
	variant: PageSkyVariant;
};

export const PageSkyBg = ({ variant }: PageSkyBgProps) => (
	<div
		className={`page-sky page-sky--${variant}`}
		aria-hidden='true'
	>
		<img
			className='page-sky-image'
			src={PAGE_SKY_SRC[variant]}
			alt=''
			decoding='async'
		/>
		<span className='page-sky-veil' />
		<span className='page-sky-shade' />
	</div>
);
