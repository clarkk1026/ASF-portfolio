import {
	about,
	contact,
	highlights,
	personal,
	traits,
} from '../data/portfolio';

export type BotMessage = {
	id: string;
	role: 'bot' | 'user';
	text: string;
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
	'Tell me about your experience',
	'Show me your projects',
	'How can I contact you?',
] as const;

export const botGreeting = `Hey there! 👋 I'm **BC AI** — think of me as Ben's voice on this site. Ask me anything you're curious about: his work, skills, projects, story, or how to reach him. I don't bite.`;

const pick = <T,>(items: T[]): T =>
	items[Math.floor(Math.random() * items.length)];

/** Expand chat shorthand: "who a u" → "who are you", "u" → "you", etc. */
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
		`I'm only here to talk about **Ben Clark** and his professional work — politely. Let's keep things respectful. Ask about his skills, experience, or projects instead.`,
		`I can't help with that. I only answer questions related to **Ben** — his development career, skills, and portfolio. Please keep it professional.`,
		`That isn't something I'll respond to. I'm Ben's portfolio assistant — happy to discuss his work, but I won't engage with rude or unrelated messages.`,
	]),
	intent: 'impolite',
	userName: ctx.userName,
});

const offTopicReply = (ctx: BotContext): BotReply => ({
	text: pick([
		`I only answer questions **related to Ben** — his development work, skills, projects, experience, and how to contact him. That topic isn't connected to him, so I'm not the right assistant for it.`,
		`That's outside my scope. I'm here specifically for **Ben Clark's portfolio** — think careers, tech, Shopify, AI, and his projects. Try something like "What are Ben's skills?"`,
		`Not related to Ben, so I can't help with that one. Ask me about his **experience**, **tech stack**, **projects**, or **contact info** — that's what I'm built for.`,
		`I'm Ben's portfolio bot, not a general assistant. If it's not about **his work or background**, I have to pass. What would you like to know about Ben?`,
	]),
	intent: 'off_topic',
	userName: ctx.userName,
});

const IMPOLITE_PATTERNS = [
	/\b(f+u+c+k+|sh+i+t+|b+i+t+c+h+|asshole|dumbass|idiot|stupid|moron|retard|loser|suck\s*(you|u|off|my)|screw\s*you|go\s*away|shut\s*up|hate\s*you|kill\s*yourself|kys)\b/,
	/\b(f+u+c+k+\s*ben|ben\s*sucks|ben\s*is\s*(trash|garbage|useless|stupid|bad))\b/,
];

const OFF_TOPIC_PATTERNS = [
	/\b(weather|forecast|temperature)\b/,
	/\b(recipe|cook|pizza|food|restaurant)\b/,
	/\b(football|soccer|basketball|nba|nfl|world\s*cup|match\s*score)\b/,
	/\b(president|election|politics|war|news\s*today)\b/,
	/\b(movie|film|song|music|album|celebrity|actor|actress|tiktok\s*trend)\b/,
	/\b(girlfriend|boyfriend|dating|love\s*life|marry\s*me)\b/,
	/\b(bitcoin|crypto|stock\s*price|lottery|gambling)\b/,
	/\b(homework|math\s*problem|solve\s*for\s*x|essay\s*about)\b/,
	/\b(capital\s*of|who\s*invented|when\s*was.*born(?!.*ben))\b/,
	/\b(tell\s*me\s*a\s*joke|make\s*me\s*laugh|play\s*a\s*game)\b/,
];

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
	'github',
	'livestorm',
	'nearform',
	'sainni',
	'shopify',
	'commerce',
	'ecommerce',
	'react',
	'nextjs',
	'next',
	'node',
	'typescript',
	'javascript',
	'python',
	'ai',
	'llm',
	'fullstack',
	'stack',
	'tech',
	'freelance',
	'remote',
	'trinity',
	'dublin',
	'ireland',
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
	'buildflux',
	'clothing',
	'business',
	'entrepreneur',
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
];

const isImpolite = (q: string) => IMPOLITE_PATTERNS.some((p) => p.test(q));

const isClearlyOffTopic = (q: string, tokens: string[]) =>
	OFF_TOPIC_PATTERNS.some((p) => p.test(q)) && scoreBenRelevance(q, tokens) === 0;

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
		'Good question — ',
		'Sure, ',
		'Yeah, ',
		'Oh nice — ',
		'Happy to share — ',
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

const humanExperience = () =>
	prefix([
		`Ben's been building professionally for **5+ years** now — and it's been a solid climb.\n\nHe led as **Senior / Lead Full Stack Developer** (2023–2025, remote) — shipping React/Next.js products, mentoring devs, and weaving AI into real workflows.\n\nBefore that, **Livestorm** (2021–2023) sharpened his production skills, and **NearForm** in Dublin (2020–2021) is where he cut his teeth as a junior dev.\n\nWant details on any of those roles? Just ask.`,
		`So career-wise, Ben's got over **five years** in the game. Latest gig was **Senior / Lead Full Stack** (remote, 2023–2025). He's also done time at **Livestorm** and started out at **NearForm** in Dublin.\n\nHe's not just coding — he's led initiatives, done code reviews, and helped junior devs grow. Pretty well-rounded if you ask me.`,
	]);

const humanProjects = () =>
	prefix([
		`Some stuff he's proud of:\n\n• **SAiNNI** - AI-meets-full-stack (TypeScript, React, Node), the featured one\n• **Lumen Interiors** - Shopify storefront for a premium furniture brand\n• **Driftstay** - short-term rental bookings with Next.js and Stripe\n\nScroll to **Selected Work** on this page. There are previews. Want the GitHub? I can point you there too.`,
		`Ben's portfolio highlights a few builds that show his range:\n\n**SAiNNI** is the star — an AI-powered app with React and Node. Then there's commerce work on **Shopify**, and production-grade **Next.js** apps with proper infra behind them.\n\nThey're all on this site under Projects. Anything specific you want to know about?`,
	]);

const humanSkills = () =>
	prefix([
		`Ben's sweet spot is really three things working together:\n\n**AI engineering** — LLMs, Python, TensorFlow, PyTorch, shipping features not slide decks.\n\n**Shopify & e-commerce** — storefronts, custom apps, conversion-focused builds (plus he ran his own clothing brand, so he gets the business side).\n\n**Full-stack** — React, Next.js, Node, AWS, Vercel, the whole pipeline.\n\nHe's also strong on Postgres, MongoDB, Redis, Docker, Prisma — the usual modern stack.`,
		`If I had to sum Ben up in one line: **AI + commerce + full-stack**, all with a product mindset.\n\nHe builds intelligent features, high-performing Shopify experiences, and end-to-end web apps. Traits like ${traits.slice(0, 3).join(', ')} show up in how he actually works — not just on a CV.`,
	]);

const humanTech = (mentioned?: string) => {
	if (mentioned) {
		return prefix([
			`Yeah, **${mentioned}** is definitely in Ben's wheelhouse. His broader stack covers Next.js, React, TypeScript, Node, Postgres, Redis, Docker, AWS, Vercel, Python, and AI tooling like TensorFlow and PyTorch.\n\nHe's used to picking the right tool for the job — not just chasing hype.`,
			`**${mentioned}** — yep, he works with that regularly. Alongside it he's comfortable across frontend (React/Next/Tailwind), backend (Node/Express/Nest), databases, and cloud deploys. Pretty pragmatic engineer.`,
		]);
	}
	return prefix([
		`Tooling-wise, Ben's stack is modern and battle-tested:\n\n**Frontend:** Next.js, React, TypeScript, Tailwind\n**Backend:** Node, Express, NestJS\n**Data:** PostgreSQL, MongoDB, Redis, Prisma, Firebase\n**Infra & AI:** Docker, AWS, Vercel, Python, TensorFlow, PyTorch\n\nHe picks tools based on what the product needs — not resume padding.`,
	]);
};

const humanContact = () =>
	prefix([
		`Easiest way to reach him:\n\n📧 **${personal.email}**\n💬 **Telegram:** [web.telegram.org/a/](https://web.telegram.org/a/)\n🐙 **GitHub:** [github.com/buildflux26](https://github.com/buildflux26)\n\n${contact.subtext} — seriously, he usually gets back within a day.`,
		`Want to talk to Ben directly? Shoot him an email at **${personal.email}** or ping him on Telegram. GitHub's [buildflux26](https://github.com/buildflux26) if you want to see code first.\n\nHe's open to freelance, collabs, and full-time stuff.`,
	]);

const humanAbout = () =>
	prefix([
		`${about.intro[0]}\n\nWhat I think makes him different: he's not just a dev who codes — he **built and ran a clothing business**, so he actually understands customers, shipping, and making things people use.\n\n${about.intro[1]}`,
		`Ben's story is pretty grounded. ${about.intro[0]}\n\nThese days he's all about scalable apps, practical AI, and products that solve real problems — not vanity projects.`,
	]);

const humanFallback = (input: string, tokens: string[], ctx: BotContext) => {
	const nameBit = ctx.userName ? `, ${ctx.userName}` : '';
	const q = normalize(input);

	if (tokens.length <= 2 && !isQuestion(q)) {
		return {
			text: `Hmm${nameBit}, I'm reading "${input.trim()}" — could you say a bit more about Ben? Like "Tell me about his React experience" or "Is he open to freelance?"`,
			intent: 'clarify',
		};
	}

	if (hasWord(tokens, ['react', 'next', 'node', 'shopify', 'python', 'ai'])) {
		const tech = tokens.find((t) =>
			['react', 'next', 'node', 'shopify', 'python', 'ai'].some((x) =>
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
			text: `Ha, I'll take that as a compliment${nameBit}! 😄 Anything else about Ben — his work, skills, or how to hire him?`,
			intent: 'positive',
		};
	}

	if (hasWord(tokens, ['bad', 'worst', 'terrible', 'suck', 'hate'])) {
		return {
			text: impoliteReply(ctx).text,
			intent: 'impolite',
		};
	}

	return {
		text: `Hmm${nameBit}, I'm not fully sure what you mean — but it seems Ben-related. Try asking about his **experience**, **skills**, **projects**, or **contact info**.`,
		intent: 'clarify',
	};
};

type IntentHandler = {
	id: string;
	score: (q: string, tokens: string[], ctx: BotContext) => number;
	reply: (q: string, tokens: string[], ctx: BotContext) => string;
};

const detectTechMention = (tokens: string[]) => {
	const map: Record<string, string> = {
		react: 'React',
		nextjs: 'Next.js',
		next: 'Next.js',
		nodejs: 'Node.js',
		node: 'Node.js',
		typescript: 'TypeScript',
		javascript: 'JavaScript',
		tailwind: 'Tailwind CSS',
		shopify: 'Shopify',
		python: 'Python',
		docker: 'Docker',
		aws: 'AWS',
		vercel: 'Vercel',
		postgres: 'PostgreSQL',
		postgresql: 'PostgreSQL',
		mongodb: 'MongoDB',
		redis: 'Redis',
		prisma: 'Prisma',
		tensorflow: 'TensorFlow',
		pytorch: 'PyTorch',
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
					? `Hey ${name}! Good to meet you. I'm BC AI — basically Ben's stand-in while you browse his portfolio. What would you like to know about him?`
					: `Hey! 👋 I'm BC AI. Ben's an **AI Engineer**, **Shopify Developer**, and **Full-Stack Developer** based in ${personal.location}. What's on your mind?`,
				`Hello! I'm here to talk about **${personal.fullName}** — his work, skills, projects, all of it. Fire away with any question.`,
				`Hi there! Nice of you to stop by. Ask me anything about Ben — I know his background pretty well at this point.`,
			]);
		},
	},
	{
		id: 'thanks',
		score: (q) => (matches(q, [/thank|thanks|thx|appreciate|cheers|grateful|helpful/]) ? 11 : 0),
		reply: (_q, _t, ctx) =>
			pick([
				`Anytime${ctx.userName ? `, ${ctx.userName}` : ''}! If Ben's a fit for what you need, ${personal.email} is the move.`,
				`You're welcome! Glad I could help. Feel free to keep asking — or reach out to Ben directly whenever you're ready.`,
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
				`Bye! 👋 Come back anytime — I'll be here.`,
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
			`I'm basically your guide to everything Ben. Ask naturally — like you're texting a friend who knows him well.\n\nExamples:\n• "What's his experience like?"\n• "Does he know Shopify?"\n• "Can I hire him for freelance?"\n• "Tell me about SAiNNI"\n\nNo need to be formal. I'll figure out what you mean.`,
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
				`I'm **BC AI** — Ben's portfolio assistant. Think of me as the friendly version of his CV. ${personal.fullName} is a ${personal.title} in ${personal.location}. ${personal.tagline}`,
				`Name's BC AI. I'm not Ben himself, but I know his story inside out. Ben builds products across **AI**, **Shopify**, and **full-stack** — based in ${personal.location}.`,
			]);
		},
	},
	{
		id: 'experience',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/work experience|job history|career|resume|cv|employment|professional background/]))
				s += 11;
			if (matches(q, [/tell me about (your |his |ben'?s? )?(work |job )?experience/, /years (of )?experience/, /how long has he/, /how long have/]))
				s += 10;
			if (hasWord(tokens, ['livestorm', 'nearform', 'senior', 'lead', 'junior', 'worked', 'employer']))
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
			if (hasWord(tokens, ['trinity', 'tcd'])) s += 9;
			if (hasWord(tokens, ['dublin']) && hasWord(tokens, ['study', 'college', 'university', 'degree']))
				s += 6;
			return s;
		},
		reply: () =>
			prefix([
				`Ben went to **Trinity College Dublin** (2016–2020) — solid choice.\n\nHe graduated with a **B.A. in Computer Science and Business**, **2:1 honours**. Focus areas included AI, full-stack dev, web tech, and e-commerce systems.\n\nSmart combo for someone who builds products, not just code.`,
			]),
	},
	{
		id: 'projects',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/show (me )?(your |his |ben'?s? )?(projects|work|portfolio|stuff)/, /what (have|has) (he|ben|you) built/, /selected work/]))
				s += 11;
			if (hasWord(tokens, ['sainni', 'github', 'buildflux26', 'repo'])) s += 8;
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
				`Shopify's a big part of Ben's story. He's a proper **Shopify developer** — themes, custom apps, conversion-focused storefronts.\n\nFun fact: he also **ran his own clothing brand**, so he understands merchants and customers, not just Liquid templates and APIs.`,
				`Yeah, e-commerce is core for Ben. He builds on **Shopify** and custom stacks, always thinking about performance and conversion. Running his own clothing business gave him real merchant instincts.`,
			]),
	},
	{
		id: 'ai',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/artificial intelligence|machine learning|ai engineer|ml engineer/])) s += 10;
			if (hasWord(tokens, ['ai', 'llm', 'gpt', 'chatgpt', 'copilot', 'ml', 'machine'])) s += 6;
			if (hasWord(tokens, ['tensorflow', 'pytorch', 'python'])) s += 5;
			// "cursor" as IDE — only when paired with dev/ai context
			if (hasWord(tokens, ['cursor']) && hasWord(tokens, ['ide', 'tool', 'editor', 'ai', 'code']))
				s += 5;
			return s;
		},
		reply: () =>
			prefix([
				`AI isn't a buzzword for Ben — he actually ships it. LLM APIs, Python, TensorFlow, PyTorch, intelligent features in real products.\n\nHe uses tools like Copilot and ChatGPT daily, but the goal is always **practical workflows** that save time and improve quality.`,
				`Ben's big on **practical AI**. Not demos for LinkedIn — actual features in production. Think LLM integrations, Python pipelines, and ML where it genuinely helps the product.`,
			]),
	},
	{
		id: 'about',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/about (you|ben|him)|background|story|journey|bio|personality/])) s += 10;
			if (hasWord(tokens, ['entrepreneur', 'business', 'clothing', 'founder', 'person'])) s += 6;
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
				`What stands out about Ben:\n\n${traits.map((t) => `• ${t}`).join('\n')}\n\nQuick stats: ${highlights.map((h) => `${h.value} ${h.label}`).join(' · ')}.\n\nHe's the kind of engineer who thinks about the product, not just the ticket.`,
			]),
	},
	{
		id: 'contact',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/how (can|do) i (contact|reach|email|message)/, /get in touch/, /reach (out|ben|him|you)/]))
				s += 11;
			if (hasWord(tokens, ['contact', 'email', 'telegram', 'message', 'reach'])) s += 6;
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
				`Yes — Ben's **open to freelance, collaborations, and full-time roles**. Remote works great for him; he's done it across multiple jobs.\n\nDrop him a line at **${personal.email}** — he typically replies within **24 hours**.`,
				`From what I know, he's actively open to new opportunities — freelance projects, collabs, or full-time. Remote-friendly and based in ${personal.location}. Email's the best first step: **${personal.email}**.`,
			]),
	},
	{
		id: 'location',
		score: (q, tokens) => {
			let s = 0;
			if (matches(q, [/where (is|are|does)|based in|located|live|timezone/])) s += 10;
			if (hasWord(tokens, ['dublin', 'ireland', 'location', 'remote'])) s += 5;
			return s;
		},
		reply: () =>
			prefix([
				`Ben's based in **${personal.location}**. He's worked remotely for years and is totally comfortable with distributed teams worldwide.`,
				`He's in **${personal.location}** — but location hasn't stopped him. Most of his recent roles have been remote anyway.`,
			]),
	},
	{
		id: 'livestorm',
		score: (q) => (/livestorm/.test(q) ? 12 : 0),
		reply: () =>
			`Ah, **Livestorm** — that was 2021 to 2023, remote. Ben was a **Mid-Level Full Stack Developer** there. Production apps, API optimization, agile teams with product and design, and he started bringing AI-assisted workflows into everyday dev. Good chapter in his career.`,
	},
	{
		id: 'nearform',
		score: (q) => (/nearform|near form/.test(q) ? 12 : 0),
		reply: () =>
			`**NearForm** in Dublin — that's where Ben started out (2020–2021) as a **Junior Developer**. Responsive UIs, backend integrations, turning designs into accessible apps, solid Git habits. Everyone's gotta start somewhere, and that was a strong place to learn.`,
	},
	{
		id: 'sainni',
		score: (q) => (/sainni/.test(q) ? 12 : 0),
		reply: () =>
			`**SAiNNI** is probably his most interesting build — AI meets full-stack with TypeScript, React, and Node. It's the **featured project** on this site. Code lives here: [github.com/buildflux26/SAiNNI-Project](https://github.com/buildflux26/SAiNNI-Project). Want me to tell you more about his other projects?`,
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
			`You're on Ben's portfolio right now! Sections to explore:\n\n• **About** — his story\n• **Core Skills** — what he's great at\n• **Work Experience** — jobs & education\n• **Selected Work** — project previews\n• **Tech Stack** — tools he uses daily\n• **Contact** — how to reach him\n\nUse the nav up top or just scroll. What catches your eye?`,
	},
	{
		id: 'pricing',
		score: (q, tokens) => {
			if (matches(q, [/how much|rate|price|cost|charge|budget|salary/])) return 10;
			if (hasWord(tokens, ['expensive', 'cheap', 'afford'])) return 6;
			return 0;
		},
		reply: () =>
			`Rates depend on the project — Ben doesn't publish a fixed price list here. Best approach: email him at **${personal.email}** with what you have in mind. He'll give you an honest answer once he understands scope and timeline.`,
	},
	{
		id: 'compare',
		score: (q) => (/better than|vs |versus|compare|difference between/.test(q) ? 8 : 0),
		reply: () =>
			`Ha — I'm flattered you're thinking deeply! I can't really compare Ben to others since I only know his story well. What I can say: he brings **AI + Shopify + full-stack** together with real product experience. If you tell me what you're looking for, I can say whether that fits his background.`,
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
				experience: `Want me to zoom in on a specific role — **Livestorm**, **NearForm**, or his **Senior/Lead** years? Or his **education** at Trinity?`,
				projects: `I can dive deeper into **SAiNNI**, the **e-commerce** work, or his **Next.js** apps. Which sounds interesting?`,
				skills: `Happy to go deeper on **AI**, **Shopify**, or **full-stack** — or name a tech like React or Node and I'll tell you how he uses it.`,
				contact: `Just to recap — email **${personal.email}**, Telegram, or GitHub. Want a suggestion on what to write in a first message?`,
				tech: `Name any tool or language — React, Docker, Postgres, whatever — and I'll tell you how it fits Ben's work.`,
				about: `There's also his **career timeline**, **projects**, or **what he's open to** work-wise. Where should we go next?`,
			};
			return (
				followups[ctx.lastIntent ?? ''] ??
				`Sure — what part of Ben's background interests you most? Experience, projects, skills, or how to get in touch?`
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
			text: `Go ahead — ask me anything about Ben. Skills, jobs, projects, whatever you're curious about.`,
			intent: 'empty',
			userName: ctx.userName,
		};
	}

	if (isImpolite(q)) {
		return impoliteReply(ctx);
	}

	if (isClearlyOffTopic(q, tokens)) {
		return offTopicReply(ctx);
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

	// Soft keyword rescue — only Ben-related topics
	if (scoreBenRelevance(q, tokens) > 0) {
		if (matches(q, [/contact|email|telegram|hire/])) {
			return { text: humanContact(), intent: 'contact', userName: ctx.userName };
		}
		if (matches(q, [/experience|livestorm|nearform|career|resume/])) {
			return { text: humanExperience(), intent: 'experience', userName: ctx.userName };
		}
		if (matches(q, [/project|github|portfolio|built/])) {
			return { text: humanProjects(), intent: 'projects', userName: ctx.userName };
		}
		if (matches(q, [/skill|expertise|stack/])) {
			return { text: humanSkills(), intent: 'skills', userName: ctx.userName };
		}

		const fallback = humanFallback(expanded, tokens, ctx);
		return { ...fallback, userName: ctx.userName };
	}

	return offTopicReply(ctx);
};

export const simulateTypingDelay = (text: string) => {
	const base = 450 + text.length * 14;
	const jitter = Math.random() * 280;
	return Math.min(2200, Math.max(600, base + jitter));
};
