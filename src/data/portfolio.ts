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
    FaWhatsapp,
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
	url: string;
	featured?: boolean;
};

const projectPreview = (siteUrl: string) =>
	`https://image.thum.io/get/width/1200/crop/675/noanimate/${siteUrl.replace(/\/$/, '')}`;

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
	originalName: 'Kai Wen Lim',
	birthPlace: 'Singapore',
	title: 'Full Stack Software Engineer · Python & AI · Front End',
	tagline:
		'Building web applications, backend services, APIs, and database-driven systems that solve real problems.',
	location: 'Sandpoint, Idaho, USA',
	email: 'benclarkk1026@gmail.com',
	whatsappNumber: '+1 (404) 786-3107',
	discordUsername: 'benclark10261',
	discordUserId: '',
	telegramUsername: 'lunarben',
	greeting: 'Hi, I am',
};

export const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
	personal.email,
)}&su=${encodeURIComponent('Portfolio inquiry')}`;

export const whatsappUrl = 'https://wa.me/14047863107';

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
	'Full Stack Development',
	'Python & AI',
	'Front End Engineering',
	'Communication',
	'Leadership',
	'Product Mindset',
];

export const expertise: ExpertiseItem[] = [
	{
		title: 'AI & Python Development',
		description:
			'Build Python backends, data processing workflows, REST APIs, and practical AI integrations that ship to production — not slide decks.',
		icon: FaBrain,
		iconColor: 'rgb(168, 130, 255)',
		glowColor: 'rgba(168, 130, 255, 0.55)',
		tags: ['Python', 'REST APIs', 'FastAPI', 'AI APIs', 'Automation'],
	},
	{
		title: 'Front End Development',
		description:
			'Build responsive, performant web interfaces with React, TypeScript, and modern CSS — plus Shopify storefronts for live commerce brands.',
		icon: FaReact,
		iconColor: 'rgb(97, 219, 251)',
		glowColor: 'rgba(97, 219, 251, 0.6)',
		tags: ['React', 'TypeScript', 'HTML/CSS', 'Performance', 'Responsive UI'],
	},
	{
		title: 'Shopify & E-Commerce',
		description:
			'Build and optimize production Shopify storefronts for global brands — themes, Liquid, checkout flows, and conversion-focused UX. Selected Work shows live stores across fashion, beauty, lifestyle, and retail.',
		icon: FaShopify,
		iconColor: 'rgb(150, 191, 72)',
		glowColor: 'rgba(150, 191, 72, 0.55)',
		tags: ['Shopify', 'Liquid', 'Storefronts', 'E-Commerce', 'Theme Dev'],
	},
	{
		title: 'Full Stack Engineering',
		description:
			'Architect end-to-end products with React, TypeScript, Node.js, Python APIs, and database-driven backends — from UI to deployment.',
		icon: FaLayerGroup,
		iconColor: 'rgb(31, 195, 255)',
		glowColor: 'rgba(31, 195, 255, 0.55)',
		tags: ['React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Docker'],
	},
];

export const projects: ProjectItem[] = [
	{
		title: 'Happy Hydro',
		description:
			'Shopify storefront for a leading US indoor gardening retailer, large catalog navigation, brand collections, product detail pages, and checkout flows built for repeat customers and high order volume.',
		stack: ['Shopify', 'Liquid', 'Theme Dev', 'E-commerce UX'],
		image: projectPreview('https://happyhydro.com'),
		url: 'https://happyhydro.com/',
		featured: true,
	},
	{
		title: 'Reroom AI',
		description:
			'AI-powered interior design platform with room staging, product visualization, and a conversion-focused landing experience for home and design shoppers.',
		stack: ['React', 'AI UX', 'Product Landing', 'Performance'],
		image: projectPreview('https://reroom.ai'),
		url: 'https://reroom.ai/',
	},
	{
		title: 'Labyrinth Style',
		description:
			'Luxury resort-wear Shopify store for a Cape Town brand, sale collections, product grids, and brand storytelling for kimonos, kaftans, and dresses across seasonal drops.',
		stack: ['Shopify', 'Liquid', 'Fashion Retail', 'Mobile UX'],
		image: projectPreview('https://labyrinthstyle.com'),
		url: 'https://labyrinthstyle.com/',
	},
	{
		title: 'La Boutique de Xéa',
		description:
			'French boutique e-commerce build, curated collections, localized merchandising, and a polished brand experience for everyday luxury shopping.',
		stack: ['Shopify', 'Liquid', 'International', 'Brand UX'],
		image: projectPreview('https://laboutiquedexea.com'),
		url: 'https://laboutiquedexea.com/',
	},
	{
		title: 'Remedior Skincare',
		description:
			'Direct-to-consumer skincare storefront with product-led pages, trust-focused layout, and a smooth mobile checkout path for daily skincare routines.',
		stack: ['Shopify', 'Liquid', 'DTC', 'Conversion'],
		image: projectPreview('https://remediorskincare.com'),
		url: 'https://remediorskincare.com/',
	},
	{
		title: 'Crown & Caliber',
		description:
			'Premium lifestyle and watches commerce experience, editorial sections, rich content layouts, subscription flows, and a luxury browsing journey across categories.',
		stack: ['Shopify', 'Content Commerce', 'Luxury Retail', 'UX'],
		image: projectPreview('https://www.crownandcaliber.com'),
		url: 'https://www.crownandcaliber.com/',
	},
	{
		title: 'Scharf Messer',
		description:
			'German cutlery and kitchenware storefront with sharp product photography, category-led navigation, and a premium shopping flow for chef-grade tools.',
		stack: ['Shopify', 'Liquid', 'Retail', 'International'],
		image: projectPreview('https://scharf-messer.com'),
		url: 'https://scharf-messer.com/',
	},
	{
		title: 'Pelle Classica',
		description:
			'Luxury leather goods e-commerce experience with editorial merchandising, collection pages, and a refined brand journey for handcrafted accessories.',
		stack: ['Shopify', 'Liquid', 'Luxury Retail', 'Brand UX'],
		image: projectPreview('https://pelleclassica.com'),
		url: 'https://pelleclassica.com/',
	},
	{
		title: 'Homducts',
		description:
			'Pakistan-based HVAC and home ducting commerce site with category browsing, product detail pages, and a practical checkout path for trade and retail buyers.',
		stack: ['Shopify', 'Liquid', 'Regional Commerce', 'Mobile UX'],
		image: projectPreview('https://homducts.pk'),
		url: 'https://homducts.pk/',
	},
	{
		title: 'EyeMax',
		description:
			'Optical retail storefront for eyewear and eye care products, built for quick product discovery, trust signals, and mobile-first shopping in Pakistan.',
		stack: ['Shopify', 'Liquid', 'Health Retail', 'Conversion'],
		image: projectPreview('https://eyemax.pk'),
		url: 'https://eyemax.pk/',
	},
];

export const expertiseSection = {
	section: {
		title: 'Core',
		subtitle: 'Skills',
		summary:
			'Full stack, Python/AI, and front end skills aligned with how Ben works across web apps, APIs, and production systems',
	},
};

export const projectsSection = {
	section: {
		title: 'Selected',
		subtitle: 'Work',
		summary:
			'Live Shopify storefronts shipped for fashion, beauty, lifestyle, and retail brands across the US, Europe, and beyond',
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
			'Live interested, not convinced, and neutral totals plus optional visitor notes',
	},
	headline: 'Share your take with Ben.',
	subtext:
		'Pick a status or write a note (one is enough). Name is only required when you leave a note.',
	supportLabel: 'Interested',
	disagreeLabel: 'Not convinced',
	notCareLabel: 'Neutral',
	liveCountsLabel: 'Live visitor counts',
	editResponseLabel: 'Edit my response',
	namePlaceholder: 'Your name (required for notes)',
	messagePlaceholder: 'Optional note for Ben',
	submitLabel: 'Apply',
	saveLabel: 'Save changes',
	submittingLabel: 'Applying',
	savingLabel: 'Saving',
	formNote:
		'Status and note are separate: you can apply a status twice more after the first click (2 resets), and post a note once plus edit it once. Limits do not share.',
	thanksMessage: 'Thanks! Your response is counted in the live totals.',
	repliesTitle: 'Visitor notes',
	repliesSummary: 'Sorted by newest first, then name.',
	loadingReplies: 'Loading live counts',
	loadError: 'Could not load live counts. Please refresh the page.',
	emptyReplies: 'No notes yet. Be the first to share your take.',
	notifyApplied: 'Your response was applied.',
	notifyUpdated: 'Your response was updated.',
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
		label: 'WhatsApp',
		href: whatsappUrl,
		icon: FaWhatsapp,
		iconColor: 'rgb(37, 211, 102)',
		glowColor: 'rgba(37, 211, 102, 0.55)',
	},
	{
		label: 'Telegram',
		href: `https://t.me/${personal.telegramUsername}`,
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

export const about = {
	section: {
		title: 'About',
		subtitle: 'ME',
		summary:
			'Full stack, Python/AI, and front end engineering shaped by study in Ireland, product experience, and years shipping real software',
	},
	intro: [
		'I am a Full Stack Software Engineer with experience across web applications, backend services, APIs, and database-driven systems. I was born and raised in Singapore, studied Computer Science and Information Systems at the University of Limerick in Ireland, and I am now based in Sandpoint, Idaho.',
		'My path includes graduate software roles, several years at Nearform and Cloudsmith, and a small sock business with a classmate during university. I care about reliable code, real user problems, and building things that hold up in production.',
	],
};

export const benStory = {
	summary:
		'Kai Wen Lim was born and raised in Singapore. He studied Computer Science and Information Systems at the University of Limerick in Ireland, lost both parents when he was young, and built his career from graduate roles at Stelfox through Nearform to full-stack and Python/AI work at Cloudsmith. He now lives in Sandpoint, Idaho, USA. He uses Ben Clark professionally; Kai Wen Lim is his real name.',
	earlyLife: [
		'Born and raised in Singapore. Real name: Kai Wen Lim.',
		'Lost his father young and his mother later. He did not become stronger overnight, but he learned to handle responsibility earlier than many peers — making decisions alone, adapting when life changed, and building trust with people around him.',
		'Moved to Ireland for university at the University of Limerick (B.Sc. Computer Science and Information Systems, GPA 3.9/4.0). A new culture and education system taught independence, problem-solving, and working with people from different backgrounds.',
		'He goes by Ben Clark professionally. In Ireland, Kai Wen was often mispronounced or misspelled; a roommate nicknamed him Ben and Clark worked better on CVs and international client work. Practical, not a reinvention — Kai Wen Lim is his real name.',
	],
	entrepreneurship: [
		'During university he worked while studying and spent long hours in libraries learning from business stories and people who built from nothing.',
		'With a college classmate, he started a small sock business through Threadline Co in Limerick (2019–2020) — customer research, product decisions, pricing, operations, and learning from mistakes.',
		'That e-commerce experience shaped his software work: ideas only matter when they solve real problems, and customers care about trust more than hype.',
	],
	technicalLeadership: [
		'His focus moved toward technology — systems that solve practical problems, leading into software engineering, AI integration, backend systems, and product development.',
		'He worked with small teams on different projects — sometimes technical (systems, engineering decisions), sometimes product-focused (what to build, real value).',
		'Building technology is not only code. It needs understanding users, communication, teamwork, and good decisions with limited information.',
	],
	lifeAndValues: [
		'Loss taught responsibility. Moving countries taught adaptability. The sock business taught execution. Software taught him how to turn ideas into working systems.',
		'He does not see his journey as a perfect success story — there were uncertain moments, mistakes, and hard lessons.',
		'Today he values consistency, honesty, and building with real purpose.',
		'He is based in Sandpoint, Idaho, USA — a quieter place to focus deeply on technology and live with more balance, not constant noise or attention.',
		'The through-line is building step by step: learning, adapting, and creating a foundation over time.',
	],
	teamsLed: [
		'Operations and product work with his classmate in the sock business.',
		'Technical teams on software and AI projects.',
		'Smaller cross-functional groups depending on project stage.',
	],
	lessons: [
		'An idea only matters when you turn it into something real that helps actual people.',
		'Customers care about problems solved and trust — not how exciting the idea sounds.',
		'Consistency, honesty, and building with purpose outlast shortcuts.',
		'Trust and alignment with people matter as much as skill when building anything long term.',
	],
};

/** Human-side interests Bon can mention naturally, not invented CV facts. */
export const benPersonality = {
	wellbeing: [
		'Ben cares about sustainable pace, sleep, breaks, and not burning out on long builds.',
		'He values simple healthy habits: moving when he can, eating reasonably, and stepping away from the screen when a problem needs fresh eyes.',
		'Hard work matters to him, but so does recovery, he learned that consistency beats heroic all-nighters.',
	],
	music: [
		'He often listens to music while coding, usually calm or instrumental stuff that helps focus without shouting over his thoughts.',
		'Music is more mood than genre for him: something steady in the background while he ships features or untangles a bug.',
		'He is not a musician himself, but a good soundtrack makes long build sessions feel lighter.',
	],
	playAndLife: [
		'For Ben, "play" often means tinkering, side ideas, small experiments, or exploring a new tool just to see what happens.',
		'He spent years in libraries soaking up business stories, he still enjoys learning for its own sake.',
		'He likes connecting with people who are curious, kind, and building something real, whether that is code or a business.',
	],
	valuesForVisitors: [
		'Encourage people to take care of themselves while they chase ambitious goals.',
		'Be honest when something is outside his lane, and point people toward Ben when work or collaboration is the real topic.',
		'Stay warm and human even when the question is silly, random, or not about development.',
	],
};

export const experience = {
	section: {
		title: 'Work',
		subtitle: 'Experience',
		summary:
			'From graduate developer in Ireland to full-stack, Python/AI, and front end work at Cloudsmith',
	},
	timeline: [
		{
			heading: 'Experience',
			items: [
				{
					role: 'Full Stack Software Engineer',
					org: 'Cloudsmith',
					period: '2023 to Feb 2026, Remote',
					bullets: [
						'Developed full-stack web applications across frontend, backend, and database layers.',
						'Built RESTful APIs, Python backend services, and AI-enabled workflows for practical business use.',
						'Created reusable React and TypeScript components and integrated frontends with backend systems.',
						'Improved application performance through code optimization, database improvements, and testing.',
						'Managed Git workflows, debugging, deployment, and collaboration across distributed teams.',
					],
				},
				{
					role: 'Software Developer',
					org: 'Nearform',
					period: '2021 to 2023, Ireland / Remote',
					bullets: [
						'Developed web-based software with frontend components, backend logic, and database integrations.',
						'Built Python APIs, automation scripts, and backend services connected to user-facing applications.',
						'Collaborated on requirements, debugging, performance improvements, and feature delivery.',
						'Balanced technical decisions with user and business needs in agile environments.',
					],
				},
				{
					role: 'Graduate Software Developer',
					org: 'Stelfox',
					period: '2020 to 2021, Dublin, Ireland',
					bullets: [
						'Built backend components, automation scripts, APIs, and database-backed features.',
						'Developed software using Python and web technologies in a professional team setting.',
						'Learned version control, documentation, code quality standards, and deployment practices.',
					],
				},
				{
					role: 'Graduate Business Developer',
					org: 'Threadline Co',
					period: '2019 to 2020, Limerick, Ireland',
					bullets: [
						'Started a small sock e-commerce business with a university classmate while studying.',
						'Managed customer research, product decisions, supplier communication, pricing, and sales.',
						'Learned how to validate ideas, understand customers, and operate with limited resources.',
					],
				},
			],
		},
		{
			heading: 'Education',
			items: [
				{
					role: 'B.Sc. in Computer Science and Information Systems',
					org: 'University of Limerick',
					period: '2016 to 2020, Limerick, Ireland',
					bullets: [
						'Graduated with GPA 3.9 / 4.0.',
						'Studied after moving from Singapore to Ireland for university.',
						'Foundation in software engineering, information systems, databases, and web technologies.',
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
