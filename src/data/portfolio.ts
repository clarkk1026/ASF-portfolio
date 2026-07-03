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
	originalName: 'Koyote Nara',
	title: 'AI Developer | Shopify Developer | Full Stack Engineer',
	roles: ['AI Developer', 'Shopify Developer', 'Full Stack Engineer'],
	tagline: 'Building products that solve real business problems.',
	location: 'Dublin, Ireland',
	email: 'benclarkk1026@gmail.com',
	discordUsername: 'benclark10261',
	discordUserId: '',
	telegramUsername: 'lunarben',
	greeting: 'Hi, I am',
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
		title: 'AI Development',
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
			'Build and optimize production Shopify storefronts for global brands, themes, Liquid, custom apps, checkout flows, and conversion-focused UX. Selected Work on this site shows live stores across fashion, beauty, lifestyle, and retail.',
		icon: FaShopify,
		iconColor: 'rgb(150, 191, 72)',
		glowColor: 'rgba(150, 191, 72, 0.55)',
		tags: ['Shopify', 'Liquid', 'Storefronts', 'E-Commerce', 'Theme Dev'],
	},
	{
		title: 'Full Stack Engineering',
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
			'Three domains I combine to ship intelligent commerce and technically solid products end to end',
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
			'Building products with AI, Shopify, and full stack tech shaped by real world experience and entrepreneurship',
	},
	intro: [
		'I enjoy building products that solve real business problems, combining AI, Shopify, and modern full-stack technologies. My journey has been shaped by overcoming personal challenges from an early age, adapting to new environments, and learning through real-world experience.',
		'Alongside software engineering, I built and operated a small clothing business, which taught me the importance of execution, customer focus, and consistency. Today I focus on creating scalable applications, integrating AI into practical workflows, and turning ideas into reliable products that people actually use.',
	],
};

export const benStory = {
	summary:
		'Ben is originally from Japan. He faced early loss, moved to a new country, and built stability largely on his own. That shaped his focus on independence, responsibility, and execution over promises. He started with a small sock business in university, grew it with a classmate into a clothing company, then moved into software, AI, backend systems, and product leadership while leading small teams across business and technical work.',
	earlyLife: [
		'Originally from Japan, where his birth name is Koyote Nara. Ben Clark is the name he uses professionally today.',
		'Ben lost his father when he was young and his mother later passed away as well.',
		'After that he had to adapt to living in a different country and build stability without a traditional family support system.',
		'That experience shaped how he works today: independence, responsibility, and not relying on assumptions or promises from others.',
	],
	entrepreneurship: [
		'During university he worked while studying because finances were difficult. He spent a lot of time in libraries learning business through real stories and practical thinking.',
		'He started a small sock business. It was not a perfect idea, but it gave him real experience with customers, pricing, product decisions, and operations.',
		'With a college classmate, that grew into a small clothing company. He learned that execution and consistency matter more than the idea itself.',
	],
	technicalLeadership: [
		'Later he moved into technical and product-focused work: software systems, AI integration, backend infrastructure, and product architecture.',
		'He built and led multiple small teams across different projects, product development, technical execution, and operational support for business projects with his partner.',
		'Results were practical: working products, improved live systems, and helping early ideas become stable enough for real users.',
	],
	teamsLed: [
		'A product and operations team in the clothing business.',
		'Technical teams for software and AI projects.',
		'Smaller cross-functional groups depending on project stage.',
	],
	lessons: [
		'Ideas are only the starting point. What matters is how quickly you turn them into something real.',
		'Understand the user problem deeply and stay consistent long enough for trust and traction to build.',
		'Trust and alignment in people matter as much as skill. Without that, even good ideas collapse over time.',
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
