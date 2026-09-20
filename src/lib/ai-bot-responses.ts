import {
    benPersonality,
    benStory,
    contact,
    experience,
    highlights,
    personal,
    projects,
    traits,
    whatsappUrl,
} from '../data/portfolio.js';
import { botGreeting, type BotMood } from './ai-bot-brand.js';
import {
    getGithubLockedBotReply,
    isGithubQuestion,
} from './ai-bot-github-guard.js';

export type BotMessage = {
	id: string;
	role: 'bot' | 'user';
	text: string;
	mood?: BotMood;
};

export type BotContext = {
	lastIntent: string | null;
	turn: number;
	userName?: string;
};

export type BotReply = {
	text: string;
	intent: string;
	userName?: string;
};

export const botQuickPrompts = [
	'What are your skills?',
	'Tell me about your AI agent work',
	"Tell me Ben's story",
	'How can I contact you?',
] as const;

export { botGreeting };

const pick = <T,>(items: T[]): T =>
	items[Math.floor(Math.random() * items.length)];

/** Expand chat shorthand: "who a u" to "who are you", "u" to "you", etc. */
const expandColloquial = (input: string): string => {
	let text = input.toLowerCase().trim();

	const phraseMap: [RegExp, string][] = [
		[/who\s*a\s*u\b/g, 'who are you'],
		[/who\s*r\s*u\b/g, 'who are you'],
		[/whos\s*u\b/g, 'who are you'],
		[/who\s*are\s*u\b/g, 'who are you'],
		[/wru\b/g, 'who are you'],
		[/what\s*r\s*u\b/g, 'what are you'],
		[/wat\s*r\s*u\b/g, 'what are you'],
		[/how\s*r\s*u\b/g, 'how are you'],
		[/how\s*a\s*u\b/g, 'how are you'],
		[/hru\b/g, 'how are you'],
		[/where\s*r\s*u\b/g, 'where are you'],
		[/where\s*u\s*at\b/g, 'where are you'],
		[/tell\s*me\s*bout\b/g, 'tell me about'],
		[/tell\s*bout\b/g, 'tell me about'],
		[/abt\b/g, 'about'],
		[/pls\b/g, 'please'],
		[/plz\b/g, 'please'],
		[/thx\b/g, 'thanks'],
		[/ty\b/g, 'thank you'],
		[/wat\b/g, 'what'],
		[/wht\b/g, 'what'],
		[/hw\b/g, 'how'],
		[/yr\b/g, 'your'],
		[/r\s*u\b/g, 'are you'],
		[/can\s*u\b/g, 'can you'],
		[/did\s*u\b/g, 'did you'],
		[/do\s*u\b/g, 'do you'],
		[/are\s*u\b/g, 'are you'],
		[/is\s*he\b/g, 'is ben'],
		[/does\s*he\b/g, 'does ben'],
	];

	for (const [pattern, replacement] of phraseMap) {
		text = text.replace(pattern, replacement);
	}

	const wordMap: Record<string, string> = {
		u: 'you',
		ur: 'your',
		r: 'are',
		dev: 'developer',
		proj: 'project',
		projs: 'projects',
		exp: 'experience',
		skills: 'skills',
		tech: 'technology',
		pls: 'please',
		plz: 'please',
		thx: 'thanks',
	};

	text = text
		.split(/\s+/)
		.map((word) => wordMap[word] ?? word)
		.join(' ');

	return text;
};

const impoliteReply = (ctx: BotContext): BotReply => ({
	text: pick([
		`Okay, that's not the vibe. I'm still here if you want a real conversation about Ben or literally anything civil.\n\n[[mood:annoyed]]`,
		`Sharp. I'm not going to match that energy. Reset? Ask about Ben's work or just talk like a normal person.\n\n[[mood:angry]]`,
		`Nah, I'm not doing insults. I'm Bon. Portfolio questions, life chat, or we can pretend that didn't happen.\n\n[[mood:calm]]`,
	]),
	intent: 'impolite',
	userName: ctx.userName,
});

const blockedTopicReply = (ctx: BotContext): BotReply => ({
	text: pick([
		`I'm not writing your homework or exam answers. I can explain how Ben approaches problems, or chat about something else.\n\n[[mood:annoyed]]`,
		`Hard pass on politics fights and gambling tips. Ben's work, wellbeing, music, contact info, I'm good for that.\n\n[[mood:calm]]`,
		`Can't help with that one. Not being cold, just honest. Want Ben's skills, story, or something lighter?\n\n[[mood:warm]]`,
	]),
	intent: 'blocked_topic',
	userName: ctx.userName,
});

const IMPOLITE_PATTERNS = [
	/\b(f+u+c+k+|sh+i+t+|b+i+t+c+h+|asshole|dumbass|idiot|stupid|moron|retard|loser|suck\s*(you|u|off|my)|screw\s*you|go\s*away|shut\s*up|hate\s*you|kill\s*yourself|kys)\b/,
	/\b(f+u+c+k+\s*ben|ben\s*sucks|ben\s*is\s*(trash|garbage|useless|stupid|bad))\b/,
];

/** Only hard-block topics Bon should never help with, not casual life chat. */
const BLOCKED_TOPIC_PATTERNS = [
	/\b(president|election|politics|who should i vote|political party)\b/,
	/\b(bitcoin|crypto|stock\s*price|lottery|gambling|bet\s*on)\b/,
	/\b(homework|math\s*problem|solve\s*for\s*x|essay\s*about|write\s*my\s*essay|do\s*my\s*assignment)\b/,
];

const isBlockedTopic = (q: string) =>
	BLOCKED_TOPIC_PATTERNS.some((p) => p.test(q));

const isGibberish = (q: string, tokens: string[]) => {
	if (tokens.length === 0) return false;
	if (tokens.length === 1 && tokens[0].length >= 8 && !/[aeiou]/i.test(tokens[0]))
		return true;
	if (/^(asdf|qwerty|zxcv|lol{3,}|haha{3,}|test{2,}|blah+)/i.test(q)) return true;
	if (tokens.length <= 3 && /^[a-z]{1,2}$/.test(tokens.join(''))) return true;
	return false;
};

const BEN_RELATED_TERMS = [
	'ben',
	'clark',
	'bc',
	'portfolio',
	'developer',
	'engineer',
	'development',
	'skill',
	'experience',
	'project',
	'work',
	'job',
	'career',
	'hire',
	'contact',
	'email',
	'telegram',
	'whatsapp',
	'github',
	'lindy',
	'n8n',
	'affinda',
	'rag',
	'mcp',
	'agent',
	'agents',
	'automation',
	'workflow',
	'fastapi',
	'postgresql',
	'postgres',
	'redis',
	'python',
	'ai',
	'llm',
	'hitl',
	'stack',
	'tech',
	'remote',
	'la habra',
	'california',
	'about',
	'website',
	'site',
	'resume',
	'cv',
	'available',
	'collaborate',
	'mentor',
	'lead',
	'senior',
	'business',
	'entrepreneur',
	'australia',
	'australian',
	'hong kong',
	'university',
	'leader',
	'leadership',
	'team',
	'who are you',
	'what are you',
	'your name',
	'help',
	'hello',
	'hi',
	'hey',
	'thanks',
	'thank',
	'bye',
	'more',
	'yes',
	'yeah',
	'music',
	'song',
	'health',
	'tired',
	'sleep',
	'stress',
	'feel',
	'feeling',
	'joke',
	'game',
	'bored',
	'happy',
	'sad',
];

const isStudioQuestion = (q: string, tokens: string[]) => {
	if (matches(q, [/asf(\s+team)?/, /\bstudio\b/, /\bagency\b/])) {
		return true;
	}
	if (
		hasWord(tokens, ['studio', 'agency', 'asf']) &&
		!q.includes('ben') &&
		!q.includes('clark')
	) {
		return true;
	}
	return false;
};

const studioDeflect = (ctx: BotContext): BotReply => ({
	text: pick([
		`This is **Ben Clark's** personal portfolio, not a studio site. Ask about his experience, skills, projects, or how to reach him.\n\n[[mood:calm]]`,
		`Just Ben here. Happy to talk about his AI automation work, path, or contact details.\n\n[[mood:warm]]`,
	]),
	intent: 'studio_deflect',
	userName: ctx.userName,
});

const isImpolite = (q: string) => IMPOLITE_PATTERNS.some((p) => p.test(q));

const scoreBenRelevance = (q: string, tokens: string[]) => {
	let score = 0;
	for (const term of BEN_RELATED_TERMS) {
		if (term.includes(' ')) {
			if (q.includes(term)) score += 2;
		} else if (tokens.some((t) => fuzzyWord(t, term) || t === term)) {
			score += 1;
		}
	}
	if (q.includes('ben') || q.includes('clark')) score += 3;
	return score;
};

const prefix = (lines: string[]) => {
	const openers = [
		'',
		'Good question. ',
		'Sure, ',
		'Yeah, ',
		'Oh nice. ',
		'Happy to share. ',
	];
	return pick(openers) + pick(lines);
};

const normalize = (input: string) =>
	input
		.toLowerCase()
		.trim()
		.replace(/[^\w\s@./'-]/g, ' ')
		.replace(/\s+/g, ' ');

const tokenize = (input: string) => normalize(input).split(' ').filter(Boolean);

const stem = (word: string) =>
	word
		.replace(/(ing|ed|es|s|ly|er|est)$/, '')
		.replace(/in$/, '');

const fuzzyWord = (a: string, b: string) => {
	if (a === b || a.includes(b) || b.includes(a)) return true;
	if (a.length < 4 || b.length < 4) return false;
	const sa = stem(a);
	const sb = stem(b);
	return sa === sb || sa.includes(sb) || sb.includes(sa);
};

const hasWord = (tokens: string[], terms: string[]) =>
	terms.some((term) => {
		if (term.includes(' ')) return normalize(tokens.join(' ')).includes(term);
		return tokens.some((t) => fuzzyWord(t, term));
	});

const matches = (q: string, patterns: RegExp[]) => patterns.some((p) => p.test(q));

const extractName = (q: string) => {
	const m = q.match(/(?:i'm|i am|my name is|call me)\s+([a-z]{2,20})/i);
	return m?.[1] ? m[1][0].toUpperCase() + m[1].slice(1).toLowerCase() : null;
};

const isQuestion = (q: string) =>
	/\?|^who|^what|^where|^when|^why|^how|^can|^could|^would|^is|^are|^does|^do|^did/.test(
		q,
	);

const publishedPathNote =
	`His published path on this site is **Lindy** (San Francisco, 2024–2026), **n8n** (Berlin, 2022–2024), and **Affinda** (Melbourne, 2020–2022).`;

const humanExperience = () => {
	const roles = experience.timeline[0]?.items ?? [];
	const lines = roles
		.slice(0, 4)
		.map((item) => `- **${item.role}** at **${item.org}** (${item.period})`)
		.join('\n');

	return prefix([
		`Ben has **6+ years** of experience as an **AI Automation Engineer**, spanning AI agents, LLM applications, workflow automation, and production systems.\n\n${lines}\n\nMost recent role: **AI Automation / AI Agent Engineer at Lindy** (San Francisco, 2024–2026). Ask about any employer if you want detail.`,
		`Career path in short:\n\n${lines}\n\nHe earned a **BSc (Hons) Computer Science** from **Hong Kong Baptist University** (2016–2020), with exchange study in Australia, then built through Affinda, n8n, and Lindy.`,
	]);
};

const humanProjects = () => {
	const lines = projects
		.map((p) => `- **${p.title}:** ${p.description}`)
		.join('\n\n');

	return prefix([
		`Selected work on this site includes live AI agent and workflow products:\n\n${lines}\n\nScroll to **Selected Work** or ask about a specific product.\n\n[[mood:excited]]`,
		`His portfolio highlights live platforms like **WorkflowHQ**, **Heym**, **TinyFish**, **augLab**, **Mazaal**, **Workbird**, **Redbird**, **Oya**, **APInstant**, and **Dugong**. Each card links to the live site. Want details on one of them?`,
	]);
};

const humanSkills = () =>
	prefix([
		`Ben's focus is **AI automation and agents**:\n\n**AI & agents:** AI Agents, LLM Applications, Workflow Automation, RAG, Tool Calling, MCP, Human-in-the-Loop\n\n**Backend:** Python, FastAPI, PostgreSQL, Redis\n\n**Integrations:** SaaS/CRM wiring, APIs, validation, retries, controlled execution\n\nHe picks tools based on what the workflow needs.`,
		`Think of Ben as an **AI Automation Engineer** who ships agent systems that connect LLM reasoning to real business data and tools. Core strengths: agents, RAG, tool calling, MCP, HITL controls, Python/FastAPI, and SaaS/CRM integrations.`,
	]);

const humanTech = (mentioned?: string) => {
	if (mentioned) {
		return prefix([
			`Yeah, **${mentioned}** fits Ben's wheelhouse. His broader stack covers AI agents, LLM apps, workflow automation, RAG, tool calling, MCP, Python, FastAPI, PostgreSQL, Redis, Docker, AWS, and SaaS/CRM integrations.\n\nHe's used to picking the right tool for the job, not just chasing hype.`,
			`**${mentioned}**, yep, he works with that regularly. Alongside it he's comfortable across agent orchestration, Python backends, databases, and production automation controls. Pretty pragmatic engineer.`,
		]);
	}
	return prefix([
		`Tooling-wise, Ben's stack is production-focused:\n\n**AI & automation:** AI Agents, LLM Apps, Workflow Automation, RAG / Tool Calling, MCP\n**Backend:** Python, FastAPI, PostgreSQL, Redis\n**Systems:** Docker, AWS, SaaS integrations, API integration\n\nHe picks tools based on what the product needs, not resume padding.`,
	]);
};

const humanContact = () =>
	prefix([
		`Best ways to reach Ben:\n\n**Email:** ${personal.email}\n**WhatsApp:** [${personal.whatsappNumber}](${whatsappUrl})\n**Telegram:** [@${personal.telegramUsername}](https://t.me/${personal.telegramUsername})\n**Discord:** ${personal.discordUsername}\n**LinkedIn:** ${personal.linkedinUrl}\n\n${contact.subtext}\n\n[[mood:warm]]`,
		`Email **${personal.email}**, WhatsApp **${personal.whatsappNumber}**, Telegram @${personal.telegramUsername}, Discord ${personal.discordUsername}, or LinkedIn ${personal.linkedinUrl}. He is open to AI automation, agent systems, and longer-term engineering engagements.\n\n[[mood:calm]]`,
	]);

const humanAbout = () =>
	prefix([
		`**${personal.fullName}** is an **${personal.title}** based in **${personal.location}**.\n\nHe studied **Computer Science (Hons)** at **Hong Kong Baptist University** (2016–2020), with exchange study in Australia, then built his career at **Affinda**, **n8n**, and **Lindy**.\n\n${benStory.lessons[0]}\n\n[[mood:thoughtful]]`,
		`${benStory.summary}\n\nToday he focuses on **AI agents**, **LLM applications**, and **workflow automation** that connect models to real business systems.\n\n[[mood:warm]]`,
	]);

const humanStory = () =>
	prefix([
		`Here is the honest version of Ben's path:\n\n**Early life:** ${benStory.earlyLife.join(' ')}\n\n**Product & business mindset:** ${benStory.entrepreneurship.join(' ')}\n\n**Technical work:** ${benStory.technicalLeadership.join(' ')}\n\n**Career highlights:**\n${benStory.careerHighlights.map((line) => `- ${line}`).join('\n')}\n\n**What he learned:** ${benStory.lessons.join(' ')}\n\n**Life today:** ${benStory.lifeAndValues.join(' ')}\n\n[[mood:thoughtful]]`,
		`${benStory.summary}\n\nIf you want, I can go deeper on his **university path**, **Lindy / n8n / Affinda roles**, or **selected AI projects**.\n\n[[mood:calm]]`,
	]);

const familyPrivacyReply = () =>
	pick([
		`Ben keeps family details private. Happy to talk about his **work**, **path**, or **how to reach him** instead.\n\n[[mood:calm]]`,
		`Family stuff stays off this portfolio. Ask about his **AI automation work**, **experience**, or **contact** anytime.\n\n[[mood:warm]]`,
		`He doesn't publish family or heritage details here. I can cover his **career**, **projects**, or **skills** though.\n\n[[mood:thoughtful]]`,
	]);

const appearancePrivacyReply = () =>
	pick([
		`Ben keeps personal appearance details off this site. Want his **story**, **skills**, or **contact** instead?\n\n[[mood:calm]]`,
		`I focus on his professional background, not appearance or ethnicity. Happy to cover **experience**, **projects**, or how to reach him.\n\n[[mood:warm]]`,
	]);

const notPublishedEmployerReply = (name: string) =>
	`**${name}** isn't on Ben's published career path on this site. ${publishedPathNote} Ask about any of those if you want detail.`;

const humanCasualChat = (input: string, ctx: BotContext): BotReply => {
	const nameBit = ctx.userName ? `, ${ctx.userName}` : '';
	const trimmed = input.trim();

	return {
		text: pick([
			`Fair question${nameBit}. I'm mostly here for Ben's portfolio, but I don't mind a human chat. Tell me more, or ask about his **skills**, **story**, or **contact** whenever you want.\n\n[[mood:warm]]`,
			`Ha, okay${nameBit}, I'm listening. I'm Bon, Ben's site voice. We can talk about life stuff or dive into his work, your call.\n\n[[mood:happy]]`,
			`Not everything has to be about code${nameBit}. I'm happy to chat. If Ben's background is what you came for, I know that side really well too.\n\n[[mood:calm]]`,
			`Got you${nameBit}, "${trimmed}" is a mood. I'm here for it. Want something about Ben, or just keeping it casual?\n\n[[mood:thoughtful]]`,
		]),
		intent: 'casual',
		userName: ctx.userName,
	};
};

const humanFallback = (input: string, tokens: string[], ctx: BotContext) => {
	const nameBit = ctx.userName ? `, ${ctx.userName}` : '';
	const q = normalize(input);

	if (tokens.length <= 2 && !isQuestion(q)) {
		return humanCasualChat(input, ctx);
	}

	if (hasWord(tokens, ['python', 'ai', 'llm', 'rag', 'mcp', 'agent', 'fastapi', 'redis', 'postgres'])) {
		const tech = tokens.find((t) =>
			['python', 'ai', 'llm', 'rag', 'mcp', 'agent', 'fastapi', 'redis', 'postgres'].some((x) =>
				fuzzyWord(t, x),
			),
		);
		return {
			text: humanTech(tech),
			intent: 'tech',
		};
	}

	if (hasWord(tokens, ['good', 'great', 'best', 'awesome', 'cool', 'nice'])) {
		return {
			text: `Ha, I'll take that as a compliment${nameBit}! Anything else on your mind, Ben's work, or just life stuff?\n\n[[mood:happy]]`,
			intent: 'positive',
		};
	}

	if (hasWord(tokens, ['bad', 'worst', 'terrible', 'suck', 'hate'])) {
		return {
			text: impoliteReply(ctx).text,
			intent: 'impolite',
		};
	}

	return humanCasualChat(input, ctx);
};

type IntentHandler = {
	id: string;
	score: (q: string, tokens: string[], ctx: BotContext) => number;
	reply: (q: string, tokens: string[], ctx: BotContext) => string;
};

const detectTechMention = (tokens: string[]) => {
	const map: Record<string, string> = {
		python: 'Python',
		fastapi: 'FastAPI',
		docker: 'Docker',
		aws: 'AWS',
		postgres: 'PostgreSQL',
		postgresql: 'PostgreSQL',
		redis: 'Redis',
		rag: 'RAG',
		mcp: 'MCP',
		llm: 'LLMs',
		agent: 'AI Agents',
		agents: 'AI Agents',
		automation: 'Workflow Automation',
		n8n: 'n8n',
	};
	for (const t of tokens) {
		for (const [key, label] of Object.entries(map)) {
			if (fuzzyWord(t, key)) return label;
		}
	}
	return null;
};

const handlers: IntentHandler[] = [
	{
		id: 'greeting',
		score: (q, tokens) => {
			if (matches(q, [/^(hi+|hello+|hey+|yo+|sup+|hiya|howdy)\b/, /^good (morning|afternoon|evening)/]))
				return 12;
			if (hasWord(tokens, ['hi', 'hello', 'hey', 'howdy', 'greetings'])) return 9;
			return 0;
		},
		reply: (_q, _t, ctx) => {
			const name = ctx.userName;
			return pick([
				name
					? `Hi ${name}, I'm **Bon** (AI BEN). I know Ben's work. He's an **AI Automation Engineer** in La Habra, CA, and I'm happy to just talk like a person. What's on your mind?\n\n[[mood:happy]]`
					: `Hi, I'm **Bon**. Ben Clark is an **AI Automation Engineer** in La Habra, CA. Ask about his work or how to reach him.\n\n[[mood:happy]]`,
				`Hello! I'm here for Ben's background **and** normal conversation: skills, story, music, life stuff, whatever.`,
				`Hey, nice of you to stop by. I'm Bon. Ask me about Ben's work, or just say what's up.`,
			]);
		},
	},
	{
		id: 'thanks',
		score: (q) => (matches(q, [/thank|thanks|thx|appreciate|cheers|grateful|helpful/]) ? 11 : 0),
		reply: (_q, _t, ctx) =>
			pick([
				`Anytime${ctx.userName ? `, ${ctx.userName}` : ''}! If Ben's a fit for what you need, ${personal.email} is the move.`,
				`You're welcome! Glad I could help. Feel free to keep asking, or reach out to Ben directly whenever you're ready.`,
				`Happy to help! 😊 Ben's usually pretty responsive if you email him at **${personal.email}**.`,
			]),
	},
	{
		id: 'bye',
		score: (q) =>
			matches(q, [/^(bye|goodbye|see you|later|cya|take care|gotta go|gtg)\b/]) ? 11 : 0,
		reply: (_q, _t, ctx) =>
			pick([
				`Catch you later${ctx.userName ? `, ${ctx.userName}` : ''}! Ben's at **${personal.email}** if you want to continue the conversation for real.`,
				`Bye! 👋 Come back anytime, I'll be here.`,
				`Good talking with you! Don't hesitate to reach out to Ben when the time's right.`,
			]),
	},
	{
		id: 'help',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/what can you|how can you help|what do you know|help me|what should i ask/]))
				s += 10;
			if (hasWord(tokens, ['help', 'assist', 'guide', 'options'])) s += 5;
			return s;
		},
		reply: () =>
			`I'm **Bon**. Think of me as someone who knows Ben well and actually likes talking to people.\n\nYou can ask about:\n- His **experience**, **skills**, and **projects**\n- His **path** (HKBU, Affinda, n8n, Lindy)\n- **Health & balance**, **music**, or random life chat\n- How to **contact** him\n\nNo need to be formal. I'll meet you where you are.`,
	},
	{
		id: 'identity',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/who (are|r|a) (you|u)|who are you|what (are|r) (you|u)|what are you|your name|whos u|wru\b/]))
				s += 12;
			if (matches(q, [/who is ben|tell me about ben|what is ben|about ben\b/])) s += 10;
			if (hasWord(tokens, ['bot', 'assistant']) && hasWord(tokens, ['you', 'who', 'what']))
				s += 8;
			if (hasWord(tokens, ['ben']) && hasWord(tokens, ['who', 'what'])) s += 6;
			return s;
		},
		reply: (_q, tokens) => {
			if (hasWord(tokens, ['ben']) && !hasWord(tokens, ['you', 'bot'])) {
				return humanAbout();
			}
			return pick([
				`I'm **Bon** (AI BEN), Ben's portfolio assistant. ${personal.fullName} is a ${personal.title} in ${personal.location}. ${personal.tagline}\n\n[[mood:calm]]`,
				`I'm **Bon**. Ben's voice on this site. I'm best for his skills, story, and how to reach him.\n\n[[mood:warm]]`,
			]);
		},
	},
	{
		id: 'mood_check',
		score: (q, tokens) => {
			if (matches(q, [/how are you|how r you|how you doing|hows it going|you ok|are you ok/]))
				return 12;
			if (hasWord(tokens, ['how']) && hasWord(tokens, ['you']) && tokens.length <= 5)
				return 8;
			return 0;
		},
		reply: (_q, _t, ctx) =>
			pick([
				`I'm doing alright${ctx.userName ? `, ${ctx.userName}` : ''}, thanks for asking. Kind of enjoying being the voice on Ben's site today. How are **you** doing?\n\n[[mood:happy]]`,
				`Pretty good! A little shy sometimes when I don't know someone yet, but I'm warm once we get talking. What's on your mind?\n\n[[mood:shy]]`,
				`Honestly? Calm and curious. I like when visitors actually say hi like humans. How's your day going?\n\n[[mood:calm]]`,
			]),
	},
	{
		id: 'feelings',
		score: (q, tokens) => {
			let s = 0;
			if (
				matches(q, [
					/i\s*(?:am|m)\s+(sad|lonely|stressed|anxious|tired|exhausted|down|depressed|overwhelmed)/,
				])
			)
				s += 12;
			if (matches(q, [/feeling (sad|bad|down|lonely|stressed|anxious|tired)/])) s += 10;
			if (hasWord(tokens, ['sad', 'lonely', 'anxious', 'stressed', 'overwhelmed', 'depressed']))
				s += 6;
			return s;
		},
		reply: (_q, _t, ctx) =>
			pick([
				`Hey${ctx.userName ? ` ${ctx.userName}` : ''}, I'm sorry you're carrying that. I'm just Bon on a portfolio site, not a therapist, but I do care. Take a breath if you can, drink some water, step away from the screen for a minute. If you want a real human, Ben's at **${personal.email}**. I'm here too if you want to talk about lighter stuff or his work.\n\n[[mood:sorry]]`,
				`That sounds heavy. Please be gentle with yourself today, rest counts as productive sometimes. I'm happy to listen or distract you with something about Ben's projects if that helps.\n\n[[mood:thoughtful]]`,
			]),
	},
	{
		id: 'wellness',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/health|wellness|wellbeing|well-being|sleep|exercise|workout|burnout|burn out/]))
				s += 10;
			if (hasWord(tokens, ['healthy', 'health', 'sleep', 'tired', 'rest', 'burnout'])) s += 6;
			return s;
		},
		reply: () =>
			pick([
				`${benPersonality.wellbeing[0]} ${benPersonality.wellbeing[2]}\n\nIf you're grinding on something big, code, school, life, breaks are not quitting. They're how you last.\n\n[[mood:warm]]`,
				`Ben's big on sustainable pace. ${benPersonality.wellbeing[1]} What about you, are you taking care of yourself while you're building whatever you're building?\n\n[[mood:thoughtful]]`,
			]),
	},
	{
		id: 'music',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/music|song|album|playlist|spotify|listen to/])) s += 11;
			if (hasWord(tokens, ['music', 'song', 'album', 'playlist', 'spotify'])) s += 7;
			return s;
		},
		reply: (_q, _t, ctx) =>
			pick([
				`${benPersonality.music[0]} ${benPersonality.music[1]}\n\nWhat do **you** listen to${ctx.userName ? `, ${ctx.userName}` : ''}? I'm always curious.\n\n[[mood:happy]]`,
				`Music's a big part of long build sessions for Ben. ${benPersonality.music[2]} Got a favorite track lately?\n\n[[mood:calm]]`,
			]),
	},
	{
		id: 'play',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/play a game|wanna play|lets play|bored|nothing to do/])) s += 10;
			if (hasWord(tokens, ['bored', 'game', 'play']) && tokens.length <= 6) s += 6;
			return s;
		},
		reply: () =>
			pick([
				`I'm not great at actual games in a chat box, but ${benPersonality.playAndLife[0].toLowerCase()}\n\nWant to hear about something Ben built for fun, or should we just riff?\n\n[[mood:happy]]`,
				`Boredom happens. Ben usually channels it into tinkering, ${benPersonality.playAndLife[1].toLowerCase()}\n\nTell me what you're into and we'll find a thread.\n\n[[mood:thoughtful]]`,
			]),
	},
	{
		id: 'joke',
		score: (q) =>
			matches(q, [/tell me a joke|make me laugh|say something funny|cheer me up/]) ? 11 : 0,
		reply: () =>
			pick([
				`Why do programmers prefer dark mode? Because light attracts bugs.\n\nI'll see myself out. Want a real conversation about Ben or about your day?\n\n[[mood:happy]]`,
				`A user asked Bon for the meaning of life. Bon said: "Have you tried turning it off and on again?"\n\nOkay, dad joke deployed. What else you got?\n\n[[mood:excited]]`,
			]),
	},
	{
		id: 'nonsense',
		score: (q, tokens) => (isGibberish(q, tokens) ? 11 : 0),
		reply: (_q, _t, ctx) =>
			pick([
				`Haha okay${ctx.userName ? ` ${ctx.userName}` : ''}, that was random. I'm alive. What are we actually talking about?\n\n[[mood:shocked]]`,
				`That reads like keyboard yoga. I'm not pretending it means something deep. Ben's work, music, or say something real?\n\n[[mood:playful]]`,
			]),
	},
	{
		id: 'experience',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/work experience|job history|career|resume|cv|employment|professional background/]))
				s += 11;
			if (matches(q, [/tell me about (your |his |ben'?s? )?(work |job )?experience/, /years (of )?experience/, /how long has he/, /how long have/]))
				s += 10;
			if (hasWord(tokens, ['lindy', 'n8n', 'affinda', 'senior', 'lead', 'junior', 'worked', 'employer']))
				s += 7;
			if (hasWord(tokens, ['experience', 'career', 'role', 'position', 'job'])) s += 5;
			if (hasWord(tokens, ['developer', 'engineer']) && !hasWord(tokens, ['project'])) s += 3;
			return s;
		},
		reply: () => humanExperience(),
	},
	{
		id: 'education',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/education|university|college|degree|graduate|graduated|studied|school/])) s += 10;
			if (hasWord(tokens, ['baptist', 'hkbu', 'hong'])) s += 9;
			if (hasWord(tokens, ['honours', 'honors', 'computer', 'csuf', 'exchange'])) s += 4;
			return s;
		},
		reply: () =>
			prefix([
				`Ben studied at **Hong Kong Baptist University** (2016–2020), **BSc (Hons) Computer Science**.\n\nHe completed international study and exchange experience in Australia during the degree, was recognized on the **Dean's Honors List**, and received a **CSUF Alumni Association Scholarship**.`,
			]),
	},
	{
		id: 'projects',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/show (me )?(your |his |ben'?s? )?(projects|work|portfolio|stuff)/, /what (have|has) (he|ben|you) built/, /selected work/]))
				s += 11;
			if (hasWord(tokens, ['lead', 'qualification', 'invoice', 'reconciliation', 'scheduling', 'demo']))
				s += 8;
			if (hasWord(tokens, ['project', 'projects', 'portfolio', 'built', 'builds', 'app', 'apps']))
				s += 5;
			return s;
		},
		reply: () => humanProjects(),
	},
	{
		id: 'skills',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/what (are|is) (your |his |ben'?s? )?(skills|expertise|specialt)/, /what can (he|ben|you) do/, /good at/]))
				s += 11;
			if (hasWord(tokens, ['skill', 'skills', 'expertise', 'capable', 'talented'])) s += 6;
			return s;
		},
		reply: () => humanSkills(),
	},
	{
		id: 'tech',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/tech stack|technologies|what tools|what languages/, /does (he|ben) know/, /familiar with/]))
				s += 9;
			const tech = detectTechMention(tokens);
			if (tech) s += 8;
			if (hasWord(tokens, ['frontend', 'backend', 'database', 'devops', 'stack'])) s += 5;
			return s;
		},
		reply: (_q, tokens) => humanTech(detectTechMention(tokens) ?? undefined),
	},
	{
		id: 'shopify',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/shopify|e-?commerce|ecommerce|storefront|online store/])) s += 10;
			if (hasWord(tokens, ['shopify', 'commerce', 'storefront', 'store', 'merchant'])) s += 6;
			if (hasWord(tokens, ['clothing', 'brand'])) s += 4;
			return s;
		},
		reply: () =>
			prefix([
				`Shopify and e-commerce storefronts aren't Ben's published focus on this site. He builds **AI agents**, **LLM applications**, and **workflow automation** that connect models to APIs, CRM/SaaS systems, and operational processes.\n\nAsk about his Lindy / n8n / Affinda path or the selected AI projects if you want detail.`,
				`That's not Ben's lane here. His portfolio is about **AI automation and agent systems**, not Shopify storefronts. Want a walkthrough of his agent work instead?`,
			]),
	},
	{
		id: 'ai',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/artificial intelligence|machine learning|ai engineer|ml engineer|ai agent|ai automation/]))
				s += 10;
			if (hasWord(tokens, ['ai', 'llm', 'gpt', 'chatgpt', 'copilot', 'ml', 'machine', 'rag', 'mcp', 'agent']))
				s += 6;
			if (hasWord(tokens, ['python', 'fastapi', 'hitl'])) s += 5;
			if (hasWord(tokens, ['cursor']) && hasWord(tokens, ['ide', 'tool', 'editor', 'ai', 'code']))
				s += 5;
			return s;
		},
		reply: () =>
			prefix([
				`AI is Ben's core craft, not slide-deck hype. As an **AI Automation Engineer** he builds agent workflows that combine LLM reasoning with business context, structured data, tool calling, MCP, validation, and human-in-the-loop controls.\n\nSee his Lindy / n8n / Affinda path and the live products in **Selected Work**.`,
				`Ben's AI work covers agents, RAG, tool calling, MCP, Python/FastAPI services, and production automation with clear escalation paths when outputs are uncertain.`,
			]),
	},
	{
		id: 'story',
		score: (q, tokens) => {
			let s = 0;
			if (
				matches(q, [
					/personal (story|background|life|journey)/,
					/early life/,
					/grow up/,
					/childhood/,
					/real name|birth name|original name/,
					/mother|mum|mom|parents|family/,
					/singapore|japanese|heritage/,
				])
			) {
				s += 11;
			}
			if (
				hasWord(tokens, [
					'lindy',
					'n8n',
					'affinda',
					'lesson',
					'teams',
					'mother',
					'mum',
					'japan',
					'japanese',
					'singapore',
					'singaporean',
					'family',
					'heritage',
				])
			) {
				s += 6;
			}
			return s;
		},
		reply: (q) => {
			if (matches(q, [/original name|birth name|real name|why ben clark|why the name|other name/])) {
				return pick([
					`His name is **${personal.fullName}**. That is the only name he uses on this site. He's based in **${personal.location}**.\n\n[[mood:calm]]`,
					`**${personal.fullName}**. That is his real name. No other names.\n\n[[mood:calm]]`,
				]);
			}
			if (matches(q, [/mother|mum|mom|parents|family|singapore|japanese|heritage|from japan/])) {
				return familyPrivacyReply();
			}
			if (
				matches(q, [
					/look(s| like)? asian/,
					/is (he|ben) asian/,
					/asian (look|appearance|face)/,
					/(appearance|ethnicity|race|heritage)/,
					/how does (he|ben) look/,
					/what does (he|ben) look like/,
				])
			) {
				return appearancePrivacyReply();
			}
			return humanStory();
		},
	},
	{
		id: 'appearance',
		score: (q, tokens) => {
			let s = 0;
			if (
				matches(q, [
					/look(s| like)? asian/,
					/is (he|ben) asian/,
					/asian/,
					/(appearance|ethnicity|race|heritage)/,
					/how does (he|ben) look/,
					/what does (he|ben) look like/,
				])
			) {
				s += 12;
			}
			if (hasWord(tokens, ['asian', 'appearance', 'ethnicity', 'looks', 'look'])) s += 5;
			return s;
		},
		reply: () => appearancePrivacyReply(),
	},
	{
		id: 'about',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/about (you|ben|him)|background|story|journey|bio|personality/])) s += 10;
			if (hasWord(tokens, ['entrepreneur', 'business', 'founder', 'person'])) s += 6;
			return s;
		},
		reply: () => humanAbout(),
	},
	{
		id: 'traits',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/strengths|traits|soft skills|why hire|why should i|what makes him/])) s += 10;
			if (hasWord(tokens, ['mentor', 'leadership', 'agile', 'performance', 'hire'])) s += 5;
			return s;
		},
		reply: () =>
			prefix([
				`What stands out about Ben:\n\n${traits.map((t) => `- ${t}`).join('\n')}\n\nQuick stats: ${highlights.map((h) => `${h.value} ${h.label}`).join(', ')}.\n\nHe's the kind of engineer who ships maintainable automation, not one-off scripts.`,
			]),
	},
	{
		id: 'contact',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/how (can|do) i (contact|reach|email|message)/, /get in touch/, /reach (out|ben|him|you)/]))
				s += 11;
			if (hasWord(tokens, ['contact', 'email', 'telegram', 'whatsapp', 'linkedin', 'message', 'reach'])) s += 6;
			if (hasWord(tokens, ['hire', 'recruit', 'collaborat'])) s += 5;
			return s;
		},
		reply: () => humanContact(),
	},
	{
		id: 'availability',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/available|open to|looking for work|accepting work|take on (work|projects)/, /can i hire/, /is he (free|available)/, /is ben (free|available)/]))
				s += 11;
			if (hasWord(tokens, ['freelance', 'contract', 'fulltime', 'full-time', 'remote', 'hire']))
				s += 6;
			return s;
		},
		reply: () =>
			prefix([
				`Yes. Ben is **${personal.model.toLowerCase()}**.\n\nDrop him a line at **${personal.email}**, he typically replies within **one business day**.`,
				`From what I know, he is open to remote AI automation and agent work, plus longer-term engineering engagements. Email's the best first step: **${personal.email}**.`,
			]),
	},
	{
		id: 'location',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/where (is|are|does)|based in|located|live|timezone|la habra|california/]))
				s += 10;
			if (hasWord(tokens, ['location', 'remote', 'california', 'habra', 'usa', 'united'])) s += 5;
			return s;
		},
		reply: () =>
			prefix([
				`Ben is based in **${personal.location}**. He's comfortable with remote and async teams worldwide.`,
				`These days he's in **${personal.location}**. Location hasn't stopped him. He works remotely and is used to distributed collaboration.`,
			]),
	},
	{
		id: 'mudbath',
		score: (q) => (/mudbath/.test(q) ? 12 : 0),
		reply: () => notPublishedEmployerReply('Mudbath Digital'),
	},
	{
		id: 'anditi',
		score: (q) => (/anditi/.test(q) ? 12 : 0),
		reply: () => notPublishedEmployerReply('Anditi'),
	},
	{
		id: 'fortel',
		score: (q) => (/4tel|fortel/.test(q) ? 12 : 0),
		reply: () => notPublishedEmployerReply('4Tel'),
	},
	{
		id: 'cloudsmith',
		score: (q) => (/cloudsmith/.test(q) ? 8 : 0),
		reply: () => notPublishedEmployerReply('Cloudsmith'),
	},
	{
		id: 'nearform',
		score: (q) => (/nearform|near form/.test(q) ? 8 : 0),
		reply: () => notPublishedEmployerReply('NearForm'),
	},
	{
		id: 'stelfox',
		score: (q) => (/stelfox/.test(q) ? 8 : 0),
		reply: () => notPublishedEmployerReply('Stelfox'),
	},
	{
		id: 'threadline',
		score: (q) => (/threadline|sock/.test(q) ? 8 : 0),
		reply: () =>
			`Threadline isn't part of Ben's published path on this site. ${publishedPathNote}`,
	},
	{
		id: 'lindy',
		score: (q) => (/lindy/.test(q) ? 12 : 0),
		reply: () =>
			`**Lindy** (San Francisco, 2024–2026). Ben worked as an **AI Automation / AI Agent Engineer**, designing agent workflows for multi-step business processes involving research, communication, scheduling, and operational execution, with tool-based execution, validation, and human-approval paths.`,
	},
	{
		id: 'n8n_employer',
		score: (q) => (/\bn8n\b/.test(q) ? 12 : 0),
		reply: () =>
			`**n8n** (Berlin, 2022–2024). Ben worked as a **Software Engineer / Automation Engineer**, building backend services and workflow automations connecting APIs, databases, SaaS applications, and internal systems, with validation, logging, retries, and controlled execution.`,
	},
	{
		id: 'affinda',
		score: (q) => (/affinda/.test(q) ? 12 : 0),
		reply: () =>
			`**Affinda** (Melbourne, 2020–2022). Ben worked as a **Software Engineer / AI/ML Engineer** on document-intensive processes and automated information extraction, with Python services, validation workflows, and production document automation.`,
	},
	{
		id: 'shopify_stores',
		score: (q) =>
			/happy hydro|labyrinth style|remedior|crown and caliber|laboutiquedexea|shopify store/.test(
				q,
			)
				? 12
				: 0,
		reply: () =>
			prefix([
				`Those storefronts aren't on Ben's published portfolio here. His selected work is live AI agent and workflow products like **WorkflowHQ**, **Heym**, **TinyFish**, and the other platforms on the Projects page. Want details on any of them?`,
			]),
	},
	{
		id: 'site',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/this (site|website|portfolio|page)/, /sections? on/])) s += 9;
			if (hasWord(tokens, ['portfolio', 'website', 'site', 'page', 'scroll'])) s += 4;
			return s;
		},
		reply: () =>
			`You're on **Ben Clark's** portfolio right now. Sections to explore:\n\n- **About:** his story\n- **Expertise:** what he builds\n- **Path:** career and education\n- **Selected Work:** live AI agent and workflow products\n- **Tech Stack:** tools he uses\n- **Contact:** how to reach him\n\nUse the nav up top or just scroll. What catches your eye?`,
	},
	{
		id: 'pricing',
		score: (q, tokens) => {
			if (matches(q, [/how much|rate|price|cost|charge|budget|salary/])) return 10;
			if (hasWord(tokens, ['expensive', 'cheap', 'afford'])) return 6;
			return 0;
		},
		reply: () =>
			`Rates depend on the project, Ben doesn't publish a fixed price list here. Best approach: email him at **${personal.email}** with what you have in mind. He'll give you an honest answer once he understands scope and timeline.`,
	},
	{
		id: 'compare',
		score: (q) => (/better than|vs |versus|compare|difference between/.test(q) ? 8 : 0),
		reply: () =>
			`Ha, I'm flattered you're thinking deeply! I can't really compare Ben to others since I only know his story well. What I can say: he brings **AI agents**, **LLM applications**, and **workflow automation** together with production experience from Lindy, n8n, and Affinda. If you tell me what you're looking for, I can say whether that fits his background.`,
	},
	{
		id: 'followup',
		score: (q, tokens, ctx) => {
			if (!ctx.lastIntent || ctx.turn < 1) return 0;
			if (matches(q, [/^(yes|yeah|yep|sure|ok|okay|tell me more|more|go on|continue|and\?|what else)/]))
				return 9;
			if (hasWord(tokens, ['more', 'else', 'another', 'continue']) && tokens.length <= 4) return 7;
			return 0;
		},
		reply: (_q, _t, ctx) => {
			const followups: Record<string, string> = {
				experience: `Want me to zoom in on **Lindy**, **n8n**, **Affinda**, or Ben's **education** path?`,
				projects: `I can dive deeper into **WorkflowHQ**, **Heym**, **TinyFish**, **augLab**, **Mazaal**, **Workbird**, **Redbird**, **Oya**, **APInstant**, or **Dugong**. Which one interests you?`,
				skills: `Happy to go deeper on **AI agents**, **RAG / tool calling / MCP**, **workflow automation**, or **Python / FastAPI**. Name a topic and I'll expand.`,
				contact: `Email **${personal.email}**, WhatsApp **${personal.whatsappNumber}**, Telegram **@${personal.telegramUsername}**, Discord **${personal.discordUsername}**, or LinkedIn **${personal.linkedinUrl}**. I can suggest what to write in a first message if you want.\n\n[[mood:warm]]`,
				tech: `Name any tool, Python, FastAPI, RAG, MCP, Postgres, whatever, and I'll tell you how it fits Ben's work.`,
				about: `I can also share more about his **personal journey**, **projects**, or **how to contact him**. What would you like next?\n\n[[mood:warm]]`,
				ai: `Want detail on his **agent workflows at Lindy**, **automation at n8n**, or the **selected AI projects**?`,
				lindy: `I can also cover **n8n**, **Affinda**, or his **selected AI projects** next.`,
				n8n_employer: `Want **Lindy**, **Affinda**, or the **AI project** case studies next?`,
				affinda: `Want **Lindy**, **n8n**, or his **education** path next?`,
			};
			return (
				followups[ctx.lastIntent ?? ''] ??
				`Sure, what part of Ben's background interests you most? Experience, projects, skills, or how to get in touch?`
			);
		},
	},
];

export const getBotResponse = (
	input: string,
	context: BotContext = { lastIntent: null, turn: 0 },
): BotReply => {
	const expanded = expandColloquial(input);
	const q = normalize(expanded);
	const tokens = tokenize(expanded);
	const name = extractName(expanded);
	const ctx: BotContext = {
		...context,
		userName: name ?? context.userName,
	};

	if (!q) {
		return {
			text: `Hey, I'm Bon. Ask about Ben's work, his story, music, wellbeing, or whatever's on your mind.`,
			intent: 'empty',
			userName: ctx.userName,
		};
	}

	if (isImpolite(q)) {
		return impoliteReply(ctx);
	}

	if (isGithubQuestion(expanded) || isGithubQuestion(q)) {
		return {
			text: getGithubLockedBotReply(),
			intent: 'github_locked',
			userName: ctx.userName,
		};
	}

	if (isBlockedTopic(q)) {
		return blockedTopicReply(ctx);
	}

	if (isStudioQuestion(q, tokens)) {
		return studioDeflect(ctx);
	}

	if (isGibberish(q, tokens)) {
		return {
			text: pick([
				`Haha okay, that was random. I'm alive. What's the actual question?\n\n[[mood:shocked]]`,
				`Keyboard smash detected. I'm not agreeing that it was profound. Ben's story, music, or try words?\n\n[[mood:playful]]`,
			]),
			intent: 'nonsense',
			userName: ctx.userName,
		};
	}

	let best: IntentHandler | null = null;
	let bestScore = 0;

	for (const handler of handlers) {
		const score = handler.score(q, tokens, ctx);
		if (score > bestScore) {
			bestScore = score;
			best = handler;
		}
	}

	if (best && bestScore >= 4) {
		return {
			text: best.reply(q, tokens, ctx),
			intent: best.id,
			userName: ctx.userName,
		};
	}

	// Ben-related keyword rescue
	if (scoreBenRelevance(q, tokens) > 0) {
		if (matches(q, [/contact|email|telegram|whatsapp|linkedin|hire/])) {
			return { text: humanContact(), intent: 'contact', userName: ctx.userName };
		}
		if (matches(q, [/experience|lindy|n8n|affinda|career|resume/])) {
			return { text: humanExperience(), intent: 'experience', userName: ctx.userName };
		}
		if (matches(q, [/project|portfolio|built/])) {
			return { text: humanProjects(), intent: 'projects', userName: ctx.userName };
		}
		if (matches(q, [/skill|expertise|stack/])) {
			return { text: humanSkills(), intent: 'skills', userName: ctx.userName };
		}

		const fallback = humanFallback(expanded, tokens, ctx);
		return { ...fallback, userName: ctx.userName };
	}

	return humanCasualChat(expanded, ctx);
};

export const simulateTypingDelay = (
	text: string,
	source: 'gemini' | 'groq' | 'local' = 'local',
) => {
	if (source === 'gemini' || source === 'groq') {
		const base = 40 + text.length * 0.35;
		return Math.min(110, Math.max(35, base));
	}

	const base = 60 + text.length * 0.8;
	return Math.min(160, Math.max(50, base));
};
