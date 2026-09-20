import type { IconType } from 'react-icons';
import {
	FaAws,
	FaBrain,
	FaCogs,
	FaLayerGroup,
	FaLinkedin,
	FaPython,
	FaTelegram,
	FaWhatsapp,
} from 'react-icons/fa';
import { IoMailOutline } from 'react-icons/io5';
import {
	SiDiscord,
	SiDocker,
	SiFastapi,
	SiPostgresql,
	SiRedis,
} from 'react-icons/si';
import { TbBrandOpenai } from 'react-icons/tb';

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
	image?: string;
	url?: string;
	featured?: boolean;
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
	name: 'Ben',
	heroName: 'BEN CLARK',
	heroNameLines: ['BEN CLARK'],
	heroBadge: 'AI Automation Engineer',
	heroServices: ['AI Agents', 'LLM Applications', 'Workflow Automation'],
	fullName: 'Ben Clark',
	originalName: 'Ben Clark',
	title: 'AI Automation Engineer',
	tagline:
		'I build production AI agent systems that connect LLM applications with APIs, business data, SaaS platforms, and operational workflows.',
	location: 'La Habra, CA, United States',
	email: 'benclarkk1026@gmail.com',
	whatsappNumber: '+1 (562) 603-4526',
	telegramUsername: 'benrose1026',
	discordUsername: 'benclark10261',
	discordUserId: '',
	linkedinUrl: 'https://www.linkedin.com/in/benclark1026',
	greeting: "Hi, I'm",
	heroLead: 'AI Automation Engineer | AI Agents | LLM Applications',
	model: 'Available for remote AI automation and agent work',
};

export const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
	personal.email,
)}&su=${encodeURIComponent('Ben Clark portfolio inquiry')}`;

export const whatsappUrl = 'https://wa.me/15626034526';

export const telegramUrl = `https://t.me/${personal.telegramUsername}`;

export const navLinks: NavLink[] = [
	{ label: 'Expertise', href: '/expertise' },
	{ label: 'Path', href: '/path' },
	{ label: 'Projects', href: '/projects' },
	{ label: 'Tech', href: '/tech' },
	{ label: 'Voices', href: '/voices' },
	{ label: 'About', href: '/about' },
	{ label: 'Contact', href: '/contact' },
];

export const highlights: Highlight[] = [
	{ value: '6+', label: 'Years Experience' },
	{ value: 'AI Agents', label: 'Focus' },
	{ value: 'LLM', label: 'Applications' },
	{ value: 'Production', label: 'Automation' },
];

export const traits: string[] = [
	'AI agent workflows',
	'LLM applications',
	'Workflow automation',
	'RAG and tool calling',
	'Human-in-the-loop controls',
	'Production reliability',
];

export const expertise: ExpertiseItem[] = [
	{
		title: 'AI Agents & LLM Applications',
		description:
			'Design and ship AI-agent workflows that combine LLM reasoning with business context, structured data, external APIs, and tool-based execution for multi-step processes.',
		icon: FaBrain,
		iconColor: 'rgb(168, 130, 255)',
		glowColor: 'rgba(168, 130, 255, 0.55)',
		tags: ['AI Agents', 'LLM Apps', 'Tool Calling', 'MCP', 'RAG'],
	},
	{
		title: 'Workflow Automation',
		description:
			'Build reusable automations for data sync, business processes, notifications, and application integrations, with validation, retries, logging, and controlled execution.',
		icon: FaCogs,
		iconColor: 'rgb(31, 195, 255)',
		glowColor: 'rgba(31, 195, 255, 0.55)',
		tags: ['Orchestration', 'n8n', 'APIs', 'Retries', 'Validation'],
	},
	{
		title: 'Python Backend & APIs',
		description:
			'Python services, FastAPI, REST APIs, PostgreSQL, Redis, document processing, and data pipelines that connect AI outputs to downstream business systems.',
		icon: FaPython,
		iconColor: 'rgb(55, 118, 171)',
		glowColor: 'rgba(55, 118, 171, 0.6)',
		tags: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'APIs'],
	},
	{
		title: 'Systems & Integrations',
		description:
			'CRM and SaaS integrations, business-system wiring, exception handling, human-approval paths, and cloud deployment for dependable production automation.',
		icon: FaLayerGroup,
		iconColor: 'rgb(74, 222, 128)',
		glowColor: 'rgba(74, 222, 128, 0.55)',
		tags: ['CRM', 'SaaS', 'HITL', 'Logging', 'Cloud'],
	},
];

export const projects: ProjectItem[] = [
	{
		title: 'AI Lead Qualification & Demo Scheduling',
		description:
			'AI automation workflow for inbound sales requests covering prospect research, business qualification, CRM retrieval, personalized communication, routing, and meeting scheduling. Includes structured handoffs, business rules, validation, and human escalation for uncertain cases.',
		stack: ['AI Agents', 'CRM', 'RAG', 'HITL', 'Scheduling'],
		featured: true,
	},
	{
		title: 'Enterprise Invoice Reconciliation',
		description:
			'AI agent workflow for extracting invoice information, retrieving financial records, comparing amounts and line items, identifying discrepancies, and routing exceptions for human review. Validation controls prevent uncertain results from being auto-accepted.',
		stack: ['Document AI', 'Agents', 'Validation', 'Finance', 'HITL'],
		featured: true,
	},
];

export const expertiseSection = {
	section: {
		title: 'What I',
		subtitle: 'Build',
		summary:
			'AI agents, LLM applications, and workflow automation that connect models to real business systems.',
	},
};

export const projectsSection = {
	section: {
		title: 'Selected',
		subtitle: 'Work',
		summary:
			'AI automation case studies focused on sales ops and finance workflows',
	},
};

export const contact = {
	section: {
		title: 'Get In',
		subtitle: 'Touch',
		summary:
			'Open to AI automation, agent systems, and longer-term engineering engagements.',
	},
	headline: 'Tell me what you are automating.',
	subtext:
		'Send a short note about your project. I usually reply within one business day.',
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
		label: 'Telegram',
		href: telegramUrl,
		icon: FaTelegram,
		iconColor: 'rgb(38, 165, 228)',
		glowColor: 'rgba(38, 165, 228, 0.55)',
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
		subtitle: 'Me',
		summary:
			'AI Automation Engineer in La Habra, CA, building production agent systems and workflow automation',
	},
	intro: [
		'I am Ben Clark, an AI Automation Engineer with 6 years of experience across software engineering, AI/ML, workflow automation, document intelligence, and AI agent development. I build production systems that connect LLM applications with APIs, business data, SaaS platforms, and operational workflows.',
		'My background spans Python backends, REST APIs, RAG, tool calling, MCP, validation, exception handling, and human-in-the-loop controls. I focus on turning business requirements into dependable automation that can run multi-step processes with clear validation and controlled handoffs.',
	],
};

export const benStory = {
	summary:
		'Ben Clark is an AI Automation Engineer based in La Habra, CA. He earned a BSc (Hons) in Computer Science from Hong Kong Baptist University (2016–2020), with exchange study in Australia, then built his career through Affinda, n8n, and Lindy.',
	earlyLife: [
		'Studied Computer Science at Hong Kong Baptist University (2016–2020), Bachelor of Science Honours.',
		'Completed international study and exchange experience in Australia during the degree.',
		'Recognized on the Dean’s Honors List and awarded a CSUF Alumni Association Scholarship.',
	],
	entrepreneurship: [
		'Focused on turning operational requirements into maintainable AI automation systems.',
		'Structures workflows around clear inputs, business rules, execution steps, validation, and escalation paths.',
		'Ideas only matter when they solve real problems and create reliable business outcomes.',
	],
	technicalLeadership: [
		'Built AI-agent workflows for research, communication, scheduling, and operational execution at Lindy.',
		'Developed backend services and workflow automations at n8n connecting APIs, databases, and SaaS systems.',
		'Delivered document intelligence and AI/ML extraction systems at Affinda for production document automation.',
	],
	lifeAndValues: [
		'Values clear validation, exception handling, and human-in-the-loop controls in production AI.',
		'Comfortable working across engineering and product to ship maintainable automation.',
		'Based in La Habra, CA, focused on dependable AI systems that reduce repetitive manual work.',
	],
	careerHighlights: [
		'AI Automation / AI Agent Engineer at Lindy (San Francisco, 2024–2026).',
		'Software Engineer / Automation Engineer at n8n (Berlin, 2022–2024).',
		'Software Engineer / AI/ML Engineer at Affinda (Melbourne, 2020–2022).',
	],
	lessons: [
		'Automation only helps when validation and escalation paths are built in from the start.',
		'LLM reasoning needs business context, structured data, and controlled tool execution.',
		'Consistency, logging, and retries outlast clever one-off scripts.',
		'Human approval matters when outputs are uncertain or business judgment is required.',
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
		title: 'Career',
		subtitle: 'Path',
		summary:
			'From document AI and workflow platforms to production AI agent systems',
	},
	timeline: [
		{
			heading: 'Experience',
			items: [
				{
					role: 'AI Automation / AI Agent Engineer',
					org: 'Lindy · San Francisco, CA',
					period: '2024 to 2026',
					bullets: [
						'Designed AI-agent workflows for multi-step business processes involving research, communication, scheduling, and operational execution.',
						'Built agent workflows combining LLM reasoning with business context, structured data, external APIs, and application integrations.',
						'Implemented tool-based execution, workflow state management, validation, and controlled actions for production automation.',
						'Developed human-approval and exception-handling paths for tasks needing business judgment or uncertain outputs.',
						'Translated operational requirements into maintainable AI automation systems with clear escalation paths.',
					],
				},
				{
					role: 'Software Engineer / Automation Engineer',
					org: 'n8n · Berlin, Germany',
					period: '2022 to 2024',
					bullets: [
						'Developed backend services and workflow automations connecting APIs, databases, SaaS applications, and internal business systems.',
						'Built reusable automation workflows for data synchronization, business processes, notifications, and application integrations.',
						'Integrated AI capabilities into workflow-driven applications by combining structured business rules with model-generated decisions.',
						'Improved workflow reliability through validation, error handling, logging, retries, and controlled execution.',
						'Worked with API-driven systems to reduce repetitive manual processing and improve consistency.',
					],
				},
				{
					role: 'Software Engineer / AI/ML Engineer',
					org: 'Affinda · Melbourne, Australia',
					period: '2020 to 2022',
					bullets: [
						'Developed software and AI/ML workflows for document-intensive business processes and automated information extraction.',
						'Built Python services for processing business documents, extracting structured information, and connecting results to downstream systems.',
						'Implemented data-processing and validation workflows to improve consistency of automated document intelligence.',
						'Worked with backend services, APIs, databases, and ML components to support production document automation.',
					],
				},
			],
		},
		{
			heading: 'Education',
			items: [
				{
					role: 'Bachelor of Science Honours in Computer Science',
					org: 'Hong Kong Baptist University',
					period: '2016 to 2020',
					bullets: [
						'Completed BSc (Hons) Computer Science in Hong Kong.',
						'International study and exchange experience in Australia during the degree.',
						'Dean’s Honors List · CSUF Alumni Association Scholarship.',
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
			'Tools I use to build production AI agents, APIs, and workflow automation',
	},
	groups: [
		{
			heading: 'AI & Automation',
			items: [
				{
					label: 'AI Agents',
					icon: FaBrain,
					iconColor: 'rgb(168, 130, 255)',
					glowColor: 'rgba(168, 130, 255, 0.55)',
				},
				{
					label: 'LLM Apps',
					icon: TbBrandOpenai,
					iconColor: 'rgb(116, 170, 156)',
					glowColor: 'rgba(116, 170, 156, 0.55)',
				},
				{
					label: 'Workflow Automation',
					icon: FaCogs,
					iconColor: 'rgb(31, 195, 255)',
					glowColor: 'rgba(31, 195, 255, 0.55)',
				},
				{
					label: 'RAG / Tool Calling',
					icon: FaLayerGroup,
					iconColor: 'rgb(251, 191, 36)',
					glowColor: 'rgba(251, 191, 36, 0.55)',
				},
			],
		},
		{
			heading: 'Backend',
			items: [
				{
					label: 'Python',
					icon: FaPython,
					iconColor: 'rgb(55, 118, 171)',
					glowColor: 'rgba(55, 118, 171, 0.6)',
				},
				{
					label: 'FastAPI',
					icon: SiFastapi,
					iconColor: 'rgb(0, 150, 136)',
					glowColor: 'rgba(0, 150, 136, 0.55)',
				},
				{
					label: 'PostgreSQL',
					icon: SiPostgresql,
					iconColor: 'rgb(51, 103, 145)',
					glowColor: 'rgba(51, 103, 145, 0.6)',
				},
				{
					label: 'Redis',
					icon: SiRedis,
					iconColor: 'rgb(220, 56, 45)',
					glowColor: 'rgba(220, 56, 45, 0.6)',
				},
			],
		},
		{
			heading: 'Systems & Cloud',
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
					label: 'SaaS Integrations',
					icon: FaLayerGroup,
					iconColor: 'rgb(74, 222, 128)',
					glowColor: 'rgba(74, 222, 128, 0.55)',
				},
				{
					label: 'API Integration',
					icon: FaCogs,
					iconColor: 'rgb(97, 219, 251)',
					glowColor: 'rgba(97, 219, 251, 0.55)',
				},
			],
		},
	] satisfies TechGroup[],
};
