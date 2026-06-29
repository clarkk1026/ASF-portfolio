import type { IconType } from 'react-icons';
import { BiLogoTypescript } from 'react-icons/bi';
import { DiMongodb } from 'react-icons/di';
import {
    FaAws,
    FaBrain,
    FaGithub,
    FaLayerGroup,
    FaNodeJs,
    FaPython,
    FaReact,
    FaShopify,
    FaTelegramPlane,
} from 'react-icons/fa';
import { IoMailOutline } from 'react-icons/io5';
import {
    SiDiscord,
    SiDocker,
    SiExpress,
    SiFirebase,
    SiMysql,
    SiNestjs,
    SiPostgresql,
    SiPrisma,
    SiPytorch,
    SiRedis,
    SiTailwindcss,
    SiTensorflow,
    SiVercel,
} from 'react-icons/si';
import { TbBrandNextjs } from 'react-icons/tb';

export type SocialLink = {
	label: string;
	href: string;
	icon: IconType;
	iconColor: string;
	glowColor: string;
	action?: 'discord';
};

export type NavLink = {
	label: string;
	href: string;
};

export type Highlight = {
	value: string;
	label: string;
};

export type ExpertiseItem = {
	title: string;
	description: string;
	icon: IconType;
	iconColor: string;
	glowColor: string;
	tags: string[];
};

export type ProjectItem = {
	title: string;
	description: string;
	stack: string[];
	image: string;
	featured?: boolean;
};

export type NavButton = {
	label: string;
	href: string;
	className: string;
};

export type TimelineItem = {
	role: string;
	org: string;
	period: string;
	bullets: string[];
};

export type TimelineSection = {
	heading: string;
	items: TimelineItem[];
};

export type TechItem = {
	label: string;
	icon: IconType;
	iconColor: string;
	glowColor: string;
};

export type TechGroup = {
	heading: string;
	items: TechItem[];
};

export const personal = {
	name: 'BEN CLARK',
	fullName: 'Ben Clark',
	title: 'AI Engineer | Shopify Developer | Full-Stack Developer',
	roles: ['AI Engineer', 'Shopify Developer', 'Full-Stack Developer'],
	tagline: 'Building products that solve real business problems.',
	location: 'Dublin, Ireland',
	email: 'benclarkk1026@gmail.com',
	discordUsername: 'benclark10261',
	discordUserId: '',
	greeting: 'Hi, I am',
	repoUrl: 'https://github.com/buildflux26',
	repoStarLabel: '⭐ Star this repo',
	showRepoStar: false,
};

export const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
	personal.email,
)}&su=${encodeURIComponent('Portfolio inquiry')}`;

export const navLinks: NavLink[] = [
	{ label: 'About', href: '#about-me' },
	{ label: 'Expertise', href: '#expertise' },
	{ label: 'Experience', href: '#experience' },
	{ label: 'Projects', href: '#projects' },
	{ label: 'Tech', href: '#tech-stack' },
	{ label: 'Voices', href: '#visitor-voices' },
	{ label: 'Contact', href: '#contact' },
];

export const highlights: Highlight[] = [
	{ value: '5+', label: 'Years Building' },
	{ value: '3', label: 'Core Domains' },
	{ value: 'AI', label: 'Workflows Integrated' },
	{ value: '100%', label: 'Product Mindset' },
	{ value: '10+', label: 'Projects Delivered' },
];

export const traits: string[] = [
	'AI Integration',
	'Shopify & E-Commerce',
	'Scalable Architecture',
	'Performance First',
	'Agile Delivery',
	'Mentorship',
];

export const expertise: ExpertiseItem[] = [
	{
		title: 'AI Engineering',
		description:
			'Design intelligent workflows with LLM APIs, Python pipelines, and practical AI features that ship to production, not just demos.',
		icon: FaBrain,
		iconColor: 'rgb(168, 130, 255)',
		glowColor: 'rgba(168, 130, 255, 0.55)',
		tags: ['LLM APIs', 'Python', 'TensorFlow', 'PyTorch'],
	},
	{
		title: 'Shopify Development',
		description:
			'Build high-converting storefronts, custom themes, and e-commerce systems with a founder mindset honed from running my own clothing brand.',
		icon: FaShopify,
		iconColor: 'rgb(150, 191, 72)',
		glowColor: 'rgba(150, 191, 72, 0.55)',
		tags: ['Storefronts', 'E-Commerce', 'Custom Apps', 'Conversion'],
	},
	{
		title: 'Full-Stack Engineering',
		description:
			'Architect end-to-end products with React, Next.js, Node.js, and cloud-native infrastructure, from database to deployment.',
		icon: FaLayerGroup,
		iconColor: 'rgb(31, 195, 255)',
		glowColor: 'rgba(31, 195, 255, 0.55)',
		tags: ['React', 'Next.js', 'Node.js', 'AWS', 'Vercel'],
	},
];

export const projects: ProjectItem[] = [
	{
		title: 'SAiNNI Project',
		description:
			'AI developer platform with landing, chat, analytics, and pricing. Ship AI features with TypeScript, React, and practical ML integration.',
		stack: ['TypeScript', 'React', 'AI', 'Node.js'],
		image: '/projects/project-sainni.svg',
		featured: true,
	},
	{
		title: 'Lumen Interiors',
		description:
			'Shopify storefront for a premium home furniture brand: curated collections, rich product pages, variant pickers, and checkout tuned for high-ticket orders.',
		stack: ['Shopify', 'Liquid', 'React', 'Tailwind'],
		image: '/projects/project-ecommerce.svg',
	},
	{
		title: 'Driftstay',
		description:
			'Booking platform for short-term rentals with map search, listing pages, live availability, Stripe payments, and host dashboards for property management.',
		stack: ['Next.js', 'PostgreSQL', 'Stripe', 'Mapbox'],
		image: '/projects/project-webapps.svg',
	},
];

export const expertiseSection = {
	section: {
		title: 'Core',
		subtitle: 'Skills',
		summary:
			'Three domains I combine to ship intelligent commercial and technically solid products',
	},
};

export const projectsSection = {
	section: {
		title: 'Selected',
		subtitle: 'Work',
		summary:
			'Products and experiments where AI commerce and engineering come together',
	},
};

export const contact = {
	section: {
		title: 'Get In',
		subtitle: 'Touch',
		summary:
			'Open to collaborations freelance projects and full time opportunities reach out anytime',
	},
	headline: "Let's build something remarkable.",
	subtext:
		'Open to collaborations, freelance projects, and full-time opportunities. Reach out and I typically respond within 24 hours.',
};

export type VisitorNoteSentiment = 'support' | 'disagree' | 'not-care';

export const visitorNote = {
	section: {
		title: 'Visitor',
		subtitle: 'Voices',
		summary:
			'Live interested, not convinced, and neutral counts plus every note left on this page',
	},
	headline: 'Share your take with Ben.',
	subtext:
		'Pick interested, not convinced, or neutral to vote. You can change or cancel before posting a note.',
	supportLabel: 'Interested',
	disagreeLabel: 'Not convinced',
	notCareLabel: 'Neutral',
	supportStatLabel: 'Interested',
	disagreeStatLabel: 'Not convinced',
	notCareStatLabel: 'Neutral',
	totalVisitorsStatLabel: 'Visitors',
	cancelVoteLabel: 'Cancel vote',
	namePlaceholder: 'Your name (optional)',
	messagePlaceholder: 'Your note for Ben...',
	submitLabel: 'Post note',
	submittingLabel: 'Posting...',
	formNote:
		'Post after you vote, write a note, or both. One submission per visitor.',
	thanksMessage: 'Thanks. Your note is in the list below.',
	repliesTitle: 'Reply list',
	repliesSummary: 'What visitors have shared, visible to everyone on this page.',
	loadingReplies: 'Loading replies...',
	emptyReplies: 'No replies yet. Be the first to share your take.',
	notifyVoteRecorded: 'Your vote was recorded.',
	notifyVoteUpdated: 'Your vote was updated to {sentiment}.',
	notifyVoteCancelled: 'Your vote was cancelled.',
	notifyNotePosted: 'Your note was posted.',
	notifyVisitorVote: 'A visitor voted {sentiment}.',
	notifyVoteChanged: 'A visitor changed their vote.',
	notifyNewReply: 'New note from {name}.',
};

export const socialLinks: SocialLink[] = [
	{
		label: 'GitHub',
		href: 'https://github.com/buildflux26',
		icon: FaGithub,
		iconColor: 'rgba(255, 255, 255, 0.9)',
		glowColor: 'rgba(255, 255, 255, 0.4)',
	},
	{
		label: 'Telegram',
		href: 'https://web.telegram.org/a/',
		icon: FaTelegramPlane,
		iconColor: 'rgb(0, 160, 220)',
		glowColor: 'rgba(0, 160, 220, 0.6)',
	},
	{
		label: 'Discord',
		href: 'https://discord.com/channels/@me',
		icon: SiDiscord,
		iconColor: 'rgb(88, 101, 242)',
		glowColor: 'rgba(88, 101, 242, 0.65)',
		action: 'discord',
	},
	{
		label: 'Email',
		href: gmailComposeUrl,
		icon: IoMailOutline,
		iconColor: 'rgb(18, 122, 209)',
		glowColor: 'rgba(18, 122, 209, 0.7)',
	},
];

export const navButtons: NavButton[] = [
	{ label: 'About Me', href: '/#about-me', className: 'first' },
	{ label: 'Tech', href: '/#tech-stack', className: 'sec' },
];

export const about = {
	section: {
		title: 'About',
		subtitle: 'ME',
		summary:
			'Building products with AI Shopify and full stack tech shaped by real world experience and entrepreneurship',
	},
	intro: [
		'I enjoy building products that solve real business problems, combining AI, Shopify, and modern full-stack technologies. My journey has been shaped by overcoming personal challenges from an early age, adapting to new environments, and learning through real-world experience.',
		'Alongside software engineering, I built and operated a small clothing business, which taught me the importance of execution, customer focus, and consistency. Today I focus on creating scalable applications, integrating AI into practical workflows, and turning ideas into reliable products that people actually use.',
	],
};

export const experience = {
	section: {
		title: 'Work',
		subtitle: 'Experience',
		summary:
			'5 years shipping full stack products from junior roles in Dublin to senior remote leadership',
	},
	timeline: [
		{
			heading: 'Experience',
			items: [
				{
					role: 'Senior / Lead Full Stack Developer',
					org: 'Remote',
					period: '2023 to 2025',
					bullets: [
						'Architected and delivered scalable full-stack applications.',
						'Led development initiatives, performed code reviews, and mentored junior developers.',
						'Built high-performance UIs with React, Next.js, and TypeScript.',
						'Leveraged AI tools for efficiency and code quality.',
						'Managed full feature lifecycles from planning to deployment.',
					],
				},
				{
					role: 'Mid-Level Full Stack Developer',
					org: '@Livestorm',
					period: '2021 to 2023, Remote',
					bullets: [
						'Developed and maintained production-grade web apps and backend services.',
						'Improved performance through optimization and API enhancements.',
						'Collaborated in agile environments with product and design teams.',
						'Integrated AI-assisted workflows into day-to-day development.',
					],
				},
				{
					role: 'Junior Developer',
					org: '@NearForm',
					period: '2020 to 2021, Dublin, Ireland',
					bullets: [
						'Built responsive web interfaces and backend integrations.',
						'Translated UI/UX designs into accessible applications.',
						'Collaborated via Git workflows and issue-tracking systems.',
						'Focused on debugging and performance enhancements.',
					],
				},
			],
		},
		{
			heading: 'Education',
			items: [
				{
					role: 'B.A. (Moderatorship) in Computer Science and Business',
					org: 'Trinity College Dublin',
					period: '2016 to 2020, Dublin, Ireland',
					bullets: [
						'Graduated with Second Class Honours (2:1).',
						'Focus areas: AI, Full-Stack Development, Web Technologies, and E-Commerce Systems.',
					],
				},
			],
		},
	] satisfies TimelineSection[],
};

export const techStack = {
	section: {
		title: 'Tech',
		subtitle: 'SET',
		summary:
			'A modern stack built for speed scale and shipping products people rely on every day',
	},
	groups: [
		{
			heading: 'Frontend',
			items: [
				{
					label: 'Next JS',
					icon: TbBrandNextjs,
					iconColor: 'rgb(255, 255, 255)',
					glowColor: 'rgba(255, 255, 255, 0.4)',
				},
				{
					label: 'React JS',
					icon: FaReact,
					iconColor: 'rgb(97, 219, 251)',
					glowColor: 'rgba(97, 219, 251, 0.6)',
				},
				{
					label: 'TypeScript',
					icon: BiLogoTypescript,
					iconColor: 'rgb(0, 122, 204)',
					glowColor: 'rgba(0, 122, 204, 0.6)',
				},
				{
					label: 'Tailwind CSS',
					icon: SiTailwindcss,
					iconColor: 'rgb(6, 182, 212)',
					glowColor: 'rgba(6, 182, 212, 0.7)',
				},
			],
		},
		{
			heading: 'Backend',
			items: [
				{
					label: 'Node JS',
					icon: FaNodeJs,
					iconColor: 'rgb(104, 160, 99)',
					glowColor: 'rgb(104, 160, 99)',
				},
				{
					label: 'Express JS',
					icon: SiExpress,
					iconColor: 'rgb(255, 255, 255)',
					glowColor: 'rgba(255, 255, 255, 0.4)',
				},
				{
					label: 'NestJS',
					icon: SiNestjs,
					iconColor: 'rgb(237, 34, 89)',
					glowColor: 'rgba(237, 34, 89, 0.6)',
				},
			],
		},
		{
			heading: 'Databases & Data',
			items: [
				{
					label: 'PostgreSQL',
					icon: SiPostgresql,
					iconColor: 'rgb(51, 103, 145)',
					glowColor: 'rgba(51, 103, 145, 0.6)',
				},
				{
					label: 'MongoDB',
					icon: DiMongodb,
					iconColor: 'rgb(0, 237, 100)',
					glowColor: 'rgba(0, 237, 100, 0.7)',
				},
				{
					label: 'MySQL',
					icon: SiMysql,
					iconColor: 'rgb(0, 122, 158)',
					glowColor: 'rgba(0, 122, 158, 0.75)',
				},
				{
					label: 'Redis',
					icon: SiRedis,
					iconColor: 'rgb(220, 56, 45)',
					glowColor: 'rgba(220, 56, 45, 0.6)',
				},
				{
					label: 'Firebase',
					icon: SiFirebase,
					iconColor: 'rgb(255, 196, 0)',
					glowColor: 'rgba(255, 196, 0, 0.6)',
				},
				{
					label: 'Prisma ORM',
					icon: SiPrisma,
					iconColor: 'rgb(44, 212, 224)',
					glowColor: 'rgba(44, 212, 224, 0.6)',
				},
			],
		},
		{
			heading: 'DevOps, Cloud & AI',
			items: [
				{
					label: 'Docker',
					icon: SiDocker,
					iconColor: 'rgb(36, 150, 237)',
					glowColor: 'rgba(36, 150, 237, 0.6)',
				},
				{
					label: 'AWS',
					icon: FaAws,
					iconColor: 'rgb(255, 153, 0)',
					glowColor: 'rgba(255, 153, 0, 0.6)',
				},
				{
					label: 'Vercel',
					icon: SiVercel,
					iconColor: 'rgb(255, 255, 255)',
					glowColor: 'rgba(255, 255, 255, 0.4)',
				},
				{
					label: 'Python',
					icon: FaPython,
					iconColor: 'rgb(55, 118, 171)',
					glowColor: 'rgba(55, 118, 171, 0.6)',
				},
				{
					label: 'TensorFlow',
					icon: SiTensorflow,
					iconColor: 'rgb(255, 138, 0)',
					glowColor: 'rgba(255, 138, 0, 0.6)',
				},
				{
					label: 'PyTorch',
					icon: SiPytorch,
					iconColor: 'rgb(238, 76, 44)',
					glowColor: 'rgba(238, 76, 44, 0.6)',
				},
			],
		},
	] satisfies TechGroup[],
};
