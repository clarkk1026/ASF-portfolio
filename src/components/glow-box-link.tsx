import { AnchorHTMLAttributes, DetailedHTMLProps } from 'react';

type PropsType = {
	color: string;
	icon: React.ReactNode;
	href: string;
} & DetailedHTMLProps<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	HTMLAnchorElement
>;
export const GlowLink = ({ color, icon, href, ...props }: PropsType) => {
	const isExternal = href.startsWith('http');

	return (
		<a
			href={href}
			className='glow-box glow-link'
			style={{
				'--clr': color,
			}}
			{...(isExternal
				? { target: '_blank', rel: 'noopener noreferrer' }
				: {})}
			{...props}
		>
			{icon}
		</a>
	);
};
