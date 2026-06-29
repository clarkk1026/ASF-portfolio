import { useState } from 'react';

const FALLBACK_IMAGE = '/projects/project-ecommerce.svg';

type ProjectCardImageProps = {
	src: string;
	alt: string;
};

export const ProjectCardImage = ({ src, alt }: ProjectCardImageProps) => {
	const [imageSrc, setImageSrc] = useState(src);

	return (
		<img
			src={imageSrc}
			alt={alt}
			className='project-image'
			loading='lazy'
			referrerPolicy='no-referrer'
			onError={() => {
				if (imageSrc !== FALLBACK_IMAGE) {
					setImageSrc(FALLBACK_IMAGE);
				}
			}}
		/>
	);
};
