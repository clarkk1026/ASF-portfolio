import type { IconType } from 'react-icons';
import { BiLogoTypescript } from 'react-icons/bi';
import { DiMongodb } from 'react-icons/di';
import {
    FaAws,
    FaBrain,
    FaLayerGroup,
    FaLinkedin,
    FaNodeJs,
    FaPython,
    FaReact,
    FaShopify,
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

export type TeamMember = {
	id: string;
	name: string;
	role: string;
	location: string;
	birthPlace: string;
	isLeader?: boolean;
	badge?: string;
	badgeTone?: 'founder' | 'client';
	summary: string;
	focus: string[];
};

export const team = {
	name: 'ASF',
	fullName: 'ASF Team',
	tagline:
		'We build web applications, commerce storefronts, and backend systems for clients who need working software in production. A small remote team focused on shipping.',
	heroGreeting: 'We are',
	heroLead: 'A remote software team led by Ben Clark',
	established: '2024',
	model: 'Fully remote software team across Australia',
};

export const teamMembers: TeamMember[] = [
	{
		id: 'ben-clark',
		name: 'Ben Clark',
		role: 'Full Stack Engineer & Team Lead',
		birthPlace: 'Newcastle, NSW',
		location: 'Bellingen, NSW',
		isLeader: true,
		badge: 'Leader',
		badgeTone: 'founder',
		summary:
			'Leads ASF after software engineering roles at 4Tel, Anditi, and Mudbath Digital. Owns architecture decisions, client delivery, and day-to-day engineering direction.',
		focus: ['Architecture', 'Full stack', 'Client delivery', 'Shopify'],
	},
	{
		id: 'sue-ioanis',
		name: 'Sue Ioanis',
		role: 'Lead Software Engineer',
		birthPlace: 'Wollongong, NSW',
		location: 'Geelong, Victoria',
		summary:
			'Lead engineer with experience at Mastercard, JPMorgan Chase, OkCupid, and LeafLink. Focused on scalable system integrations, distributed systems, DevOps, and reliable production software.',
		focus: ['Distributed systems', 'Integrations', 'DevOps', 'CI/CD'],
	},
	{
		id: 'yuki-mory',
		name: 'Yuki Mory',
		role: 'Senior Full Stack Developer',
		birthPlace: 'Adelaide, South Australia',
		location: 'Brisbane, Queensland',
		summary:
			'Builds APIs, databases, and React features for B2B and product platforms with a focus on clean delivery and maintainable systems.',
		focus: ['React', 'Node.js', 'PostgreSQL', 'APIs'],
	},
	{
		id: 'le-wei',
		name: 'Le Wei',
		role: 'Web Developer',
		birthPlace: 'Hong Kong',
		location: 'Hong Kong',
		summary:
			'Based in Hong Kong. Builds responsive web interfaces, polished user experiences, and dependable client-facing features.',
		focus: ['Web development', 'Frontend', 'Responsive UI', 'User experience'],
	},
	{
		id: 'marcus-hale',
		name: 'Marcus Hale',
		role: 'Python Backend Engineer',
		birthPlace: 'Cairns, Queensland',
		location: 'Hobart, Tasmania',
		summary:
			'Builds Python backends, data pipelines, and API services that stay reliable under load, with clean architecture and production monitoring.',
		focus: ['Python', 'APIs', 'Data pipelines', 'Backend'],
	},
	{
		id: 'alex-dean',
		name: 'Alex Dean',
		role: 'Full Stack Software Developer',
		birthPlace: 'Ballarat, Victoria',
		location: 'Darwin, Northern Territory',
		summary:
			'Builds full stack web applications across front end, APIs, and databases, shipping features that hold up in production.',
		focus: ['Full stack', 'React', 'Node.js', 'APIs'],
	},
];

export const personal = {
	name: 'ASF',
	heroName: 'ASF TEAM',
	heroNameLines: ['ASF TEAM'],
	heroBadge: 'Remote Software Team',
	heroServices: ['Web Apps', 'Shopify', 'Python Backends'],
	fullName: 'Ben Clark',
	originalName: 'Ben Clark',
	birthPlace: 'Newcastle, NSW, Australia',
	/** Ask-only: do not volunteer unless the visitor asks about family / heritage. */
	motherOrigin: 'Japan',
	/** Ask-only: do not volunteer unless the visitor asks about looks / ethnicity. */
	appearance: 'Asian',
	title: 'Full Stack Engineer & Team Lead',
	tagline: team.tagline,
	location: 'Bellingen, Australia',
	email: 'benclarkk1026@gmail.com',
	whatsappNumber: '+1 (562) 603-4526',
	discordUsername: 'benclark10261',
	discordUserId: '',
	linkedinUrl: 'https://www.linkedin.com/in/benclark1026',
	greeting: team.heroGreeting,
	heroLead: team.heroLead,
};

export const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
	personal.email,
)}&su=${encodeURIComponent('ASF Team inquiry')}`;

export const whatsappUrl = 'https://wa.me/15626034526';

export const navLinks: NavLink[] = [
	{ label: 'Team', href: '/team' },
	{ label: 'Expertise', href: '/expertise' },
	{ label: 'Path', href: '/path' },
	{ label: 'Projects', href: '/projects' },
	{ label: 'Tech', href: '/tech' },
	{ label: 'Voices', href: '/voices' },
	{ label: 'About Us', href: '/about' },
	{ label: 'Contact', href: '/contact' },
];

export const highlights: Highlight[] = [
	{ value: '6', label: 'Team Members' },
	{ value: '2024', label: 'Founded' },
	{ value: '100%', label: 'Remote' },
	{ value: '10+', label: 'Client Projects' },
	{ value: 'Full stack', label: 'Delivery' },
];

export const traits: string[] = [
	'Full stack delivery',
	'Python and backend APIs',
	'Shopify and commerce',
	'Clear client communication',
	'Remote collaboration',
	'Production-first engineering',
];

export const expertise: ExpertiseItem[] = [
	{
		title: 'Python and Backend Development',
		description:
			'Python services, REST APIs, data processing, and automation. We integrate model APIs where they solve a real problem, with logging and fallbacks built in from the start.',
		icon: FaBrain,
		iconColor: 'rgb(168, 130, 255)',
		glowColor: 'rgba(168, 130, 255, 0.55)',
		tags: ['Python', 'REST APIs', 'FastAPI', 'AI APIs', 'Automation'],
	},
	{
		title: 'Front End Development',
		description:
			'React and TypeScript interfaces, responsive layout, and performance work. We also build and maintain Shopify storefronts for live commerce brands.',
		icon: FaReact,
		iconColor: 'rgb(97, 219, 251)',
		glowColor: 'rgba(97, 219, 251, 0.6)',
		tags: ['React', 'TypeScript', 'HTML/CSS', 'Performance', 'Responsive UI'],
	},
	{
		title: 'Shopify and E-Commerce',
		description:
			'Theme development, Liquid customisation, checkout flows, and catalog UX for brands that sell online every day. See Selected Work for live examples.',
		icon: FaShopify,
		iconColor: 'rgb(150, 191, 72)',
		glowColor: 'rgba(150, 191, 72, 0.55)',
		tags: ['Shopify', 'Liquid', 'Storefronts', 'E-Commerce', 'Theme Dev'],
	},
	{
		title: 'Full Stack Engineering',
		description:
			'End-to-end product work: React front ends, Node or Python APIs, PostgreSQL or MongoDB, and deployment pipelines. One team owns the path from design to production.',
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
		title: 'What We',
		subtitle: 'Build',
		summary:
			'Full stack web applications, Python backends, and commerce work. These are the areas where the team spends most of its time.',
	},
};

export const projectsSection = {
	section: {
		title: 'Selected',
		subtitle: 'Work',
		summary:
			'Storefronts and web products we have shipped for retail, lifestyle, and product brands',
	},
};

export const teamSection = {
	section: {
		title: 'Our',
		subtitle: 'Team',
		summary:
			'A small remote team. Ben Clark is CTO and leads delivery.',
	},
};

export const contact = {
	section: {
		title: 'Get In',
		subtitle: 'Touch',
		summary:
			'Open to new client work, collaborations, and longer-term engagements. Ben handles initial enquiries.',
	},
	headline: 'Tell us what you are building.',
	subtext:
		'Send a short note about your project. We usually reply within one business day.',
};

export type VisitorNoteSentiment = 'support' | 'disagree' | 'not-care';

export const visitorNote = {
	section: {
		title: 'Visitor',
		subtitle: 'Voices',
		summary:
			'Live interested, not convinced, and neutral totals plus optional visitor notes',
	},
	headline: 'Share your take with ASF.',
	subtext:
		'Pick a status or write a note (one is enough). Name is only required when you leave a note.',
	supportLabel: 'Interested',
	disagreeLabel: 'Not convinced',
	notCareLabel: 'Neutral',
	liveCountsLabel: 'Live visitor counts',
	editResponseLabel: 'Edit my response',
	namePlaceholder: 'Your name (required for notes)',
	messagePlaceholder: 'Optional note for the team',
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
	leaveContactLabel: 'Leave your contact',
	leaveContactHint:
		'Want Ben to reach you later? Share any contact method you prefer.',
	contactModalTitle: 'Leave your contact',
	contactModalSubtext:
		'Share WhatsApp, Telegram, email, Discord, phone, or any other way to reach you.',
	contactNamePlaceholder: 'Your name',
	contactChannelLabel: 'Contact type',
	contactValuePlaceholder: 'Your contact (number, @handle, email...)',
	contactNotePlaceholder: 'Optional short note',
	contactSubmitLabel: 'Send contact',
	contactSubmittingLabel: 'Sending...',
	contactCancelLabel: 'Cancel',
	contactThanks: 'Thanks! Your contact info was saved.',
};

export const socialLinks: SocialLink[] = [
	{
		label: 'WhatsApp',
		href: whatsappUrl,
		icon: FaWhatsapp,
		iconColor: 'rgb(37, 211, 102)',
		glowColor: 'rgba(37, 211, 102, 0.55)',
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
		label: 'LinkedIn',
		href: personal.linkedinUrl,
		icon: FaLinkedin,
		iconColor: 'rgb(10, 102, 194)',
		glowColor: 'rgba(10, 102, 194, 0.55)',
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
		subtitle: 'Us',
		summary:
			'A remote software team led by CTO Ben Clark since 2024, working across full stack engineering, commerce, and backend systems',
	},
	intro: [
		'ASF started when Ben Clark began taking on client work with a small group of developers he trusted, building on years of software engineering in Newcastle, Australia, from 4Tel and Anditi through Mudbath Digital. As CTO, he stays close to architecture, delivery, and clients while the team remains fully remote and tightly staffed.',
		'We take on a limited number of projects at a time. Ben still writes code, reviews architecture, and talks to clients directly. The rest of the team owns their areas: Sue on scalable integrations and distributed systems, Yuki on full stack features, Le Wei on web development, Marcus on Python backends, and Alex on full stack development.',
	],
};

export const benStory = {
	summary:
		'Ben Clark is based in Bellingen, Australia. He earned a Bachelor of Software Engineering (Honours) from The University of Newcastle (2016–2020), then built his career in Newcastle at 4Tel, Anditi, and Mudbath Digital before leading ASF Team as CTO. His real name is Ben Clark.',
	earlyLife: [
		'Originally from Newcastle, NSW, Australia. Real name: Ben Clark.',
		'Studied at The University of Newcastle, Australia, completing a Bachelor of Software Engineering (Honours) from 2016 to 2020.',
		'During university he built a strong foundation in software engineering while working on practical projects and learning how technology solves real-world problems.',
	],
	entrepreneurship: [
		'Beyond traditional engineering roles, Ben has been involved in product-focused and business-oriented projects.',
		'That experience shaped how he thinks about customer needs, product decisions, business priorities, user experience, and the link between technology and outcomes.',
		'Ideas only matter when they solve real problems and create value for users.',
	],
	technicalLeadership: [
		'After graduating he began his professional software career in Newcastle, contributing to customer-facing and business-focused products across several technology companies.',
		'He developed as a product-minded engineer who understands both technical and business requirements, with strong ownership from requirements through delivery.',
		'Building technology is not only code. It needs clear communication, documentation, collaboration, and good decisions with limited information.',
	],
	lifeAndValues: [
		'He values clear communication, continuous improvement, and solving practical problems that create value for users.',
		'Responsible and self-driven, comfortable working independently or in teams, including remote and async environments.',
		'Prefers structured problem-solving and ownership over simply completing assigned tasks.',
		'He is based in Bellingen, Australia, focused on meaningful products, challenging problems, and growing with strong engineering teams.',
		'The through-line is building step by step: learning, adapting, and delivering software that supports real business needs.',
	],
	teamsLed: [
		'ASF Team, a small remote delivery team since 2024.',
		'Product and engineering delivery at Mudbath Digital, Anditi, and 4Tel in Newcastle.',
	],
	lessons: [
		'An idea only matters when you turn it into something real that helps actual people.',
		'Customers and businesses care about problems solved and trust, not how exciting the idea sounds.',
		'Consistency, honesty, and ownership outlast shortcuts.',
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
		'He still enjoys learning for its own sake: new tools, better ways of shipping, and how products create value.',
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
		title: 'Team',
		subtitle: 'Path',
		summary:
			'How ASF grew from Ben Clark\'s engineering background in Newcastle into a remote delivery team',
	},
	timeline: [
		{
			heading: 'Team',
			items: [
				{
					role: 'ASF Team',
					org: 'Remote software team',
					period: '2024 to Present',
					bullets: [
						'Ben Clark leads ASF as CTO, delivering client software with a small, trusted team.',
						'Core focus: full stack web apps, Shopify commerce, Python backends, and ML integrations.',
						'Current team: Ben, Sue Ioanis, Yuki Mory, Le Wei, Marcus Hale, and Alex Dean.',
					],
				},
				{
					role: 'Software Engineer',
					org: 'Mudbath Digital',
					period: 'May 2024 to February 2026',
					bullets: [
						'Worked on modern digital products and customer-facing applications in Newcastle, NSW.',
						'Strengthened product-focused delivery, stakeholder collaboration, and full software delivery ownership.',
					],
				},
				{
					role: 'Software Engineer',
					org: 'Anditi',
					period: 'July 2021 to April 2024',
					bullets: [
						'Built business-focused solutions across different application types and customer requirements.',
						'Grew collaboration skills and experience delivering software that supports real business needs.',
					],
				},
				{
					role: 'Software Engineer',
					org: '4Tel',
					period: 'September 2020 to June 2021',
					bullets: [
						'Started professional career in Newcastle in a structured engineering environment.',
						'Contributed to software projects as part of a professional development team.',
					],
				},
			],
		},
		{
			heading: 'Education',
			items: [
				{
					role: 'Bachelor of Software Engineering (Honours)',
					org: 'The University of Newcastle, Australia',
					period: '2016 to 2020',
					bullets: [
						'Built a strong foundation in software engineering through coursework and practical projects.',
						'Learned how technology can be applied to solve real-world problems, the base for later technical leadership at ASF.',
					],
				},
			],
		},
	] satisfies TimelineSection[],
};

export const techStack = {
	section: {
		title: 'Tech',
		subtitle: 'Stack',
		summary:
			'Tools and frameworks the team uses on client work day to day',
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
