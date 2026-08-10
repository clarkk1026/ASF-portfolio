import {
	hasBotMoodTag,
	parseBotMood,
	resolveMoodFromIntent,
	stripGithubFromReply,
	type BotMood,
} from './ai-bot-brand.js';
import { getBotResponse, type BotContext } from './ai-bot-responses.js';
import { callGeminiChat } from './ai-bot-gemini.js';
import { callGroqChat } from './ai-bot-groq.js';
import { buildBotSystemPrompt } from './ai-bot-context.js';
import {
	buildVisitorSessionNotes,
	extractVisitorName,
} from './ai-bot-visitor-context.js';
import {
	getGithubLockedBotReply,
	isGithubQuestion,
} from './ai-bot-github-guard.js';
import { personal } from '../data/portfolio.js';

export type ChatHistoryItem = {
	role: 'user' | 'assistant';
	content: string;
};

export type ChatRequestBody = {
	message: string;
	history?: ChatHistoryItem[];
	context?: BotContext;
};

export type ChatReplySource = 'gemini' | 'groq' | 'local';

export type ChatResponseBody = {
	text: string;
	intent: string;
	source: ChatReplySource;
	mood?: BotMood;
	showGithubAlert?: boolean;
	userName?: string;
};

const MAX_MESSAGE_LENGTH = 500;

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 40;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const checkRateLimit = (key: string) => {
	const now = Date.now();
	const bucket = rateBuckets.get(key);

	if (!bucket || now > bucket.resetAt) {
		rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
		return true;
	}

	if (bucket.count >= RATE_LIMIT) return false;
	bucket.count += 1;
	return true;
};

const toModelHistory = (history: ChatHistoryItem[] = []) =>
	history
		.filter(
			(item) =>
				(item.role === 'user' || item.role === 'assistant') &&
				item.content.trim(),
		)
		.map((item) => ({
			role: item.role,
			content: item.content.trim().slice(0, MAX_MESSAGE_LENGTH),
		}));

const buildSystemPrompt = (context: BotContext) => {
	const sessionNotes = buildVisitorSessionNotes(context);
	return sessionNotes
		? `${buildBotSystemPrompt()}\n\n${sessionNotes}`
		: buildBotSystemPrompt();
};

const formatReply = (
	rawText: string,
	intent: string,
	source: ChatReplySource,
	showGithubAlert = false,
	userName?: string,
): ChatResponseBody => {
	const cleaned = stripGithubFromReply(rawText);
	const hadMoodTag = hasBotMoodTag(cleaned);
	const { text, mood } = parseBotMood(cleaned);

	return {
		text,
		intent,
		source,
		mood: hadMoodTag ? mood : resolveMoodFromIntent(intent),
		showGithubAlert,
		userName,
	};
};

const callPrimaryModel = async (
	message: string,
	history: ChatHistoryItem[],
	context: BotContext,
	geminiApiKey?: string,
	groqApiKey?: string,
): Promise<{ text: string; source: ChatReplySource }> => {
	const modelHistory = toModelHistory(history);
	const systemPrompt = buildSystemPrompt(context);

	// Prefer Groq when available — typically faster and avoids Gemini region blocks.
	if (groqApiKey) {
		try {
			const text = await callGroqChat(
				groqApiKey,
				message,
				modelHistory,
				systemPrompt,
			);
			return { text, source: 'groq' };
		} catch (error) {
			console.error('[bon-chat] Groq failed:', error);
		}
	}

	if (geminiApiKey) {
		const text = await callGeminiChat(
			geminiApiKey,
			message,
			modelHistory,
			context,
		);
		return { text, source: 'gemini' };
	}

	throw new Error('No AI provider available');
};

export const handleChatRequest = async (
	body: ChatRequestBody,
	keys: { geminiApiKey?: string; groqApiKey?: string },
	clientKey: string,
): Promise<ChatResponseBody> => {
	const message = body.message?.trim() ?? '';
	const baseContext: BotContext = body.context ?? { lastIntent: null, turn: 0 };
	const context: BotContext = {
		...baseContext,
		userName: extractVisitorName(message) ?? baseContext.userName,
	};

	if (!message) {
		return formatReply(
			`Hey! I'm Bon. Ask about Ben's work, his story, or just chat like a normal person. I'm listening.\n\n[[mood:warm]]`,
			'empty',
			'local',
		);
	}

	if (message.length > MAX_MESSAGE_LENGTH) {
		return formatReply(
			`That is a bit long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.\n\n[[mood:shy]]`,
			'too_long',
			'local',
		);
	}

	if (!checkRateLimit(clientKey)) {
		return formatReply(
			`You are sending messages quickly. Please wait a moment, or email Ben at **${personal.email}**.\n\n[[mood:calm]]`,
			'rate_limit',
			'local',
		);
	}

	if (isGithubQuestion(message)) {
		return formatReply(
			getGithubLockedBotReply(),
			'github_locked',
			'local',
			true,
		);
	}

	const localGuard = getBotResponse(message, context);
	if (localGuard.intent === 'impolite' || localGuard.intent === 'blocked_topic') {
		return formatReply(
			localGuard.text,
			localGuard.intent,
			'local',
			false,
			localGuard.userName ?? context.userName,
		);
	}

	if (!keys.geminiApiKey && !keys.groqApiKey) {
		return formatReply(
			localGuard.text,
			localGuard.intent,
			'local',
			false,
			localGuard.userName ?? context.userName,
		);
	}

	try {
		const { text, source } = await callPrimaryModel(
			message,
			body.history ?? [],
			context,
			keys.geminiApiKey,
			keys.groqApiKey,
		);

		return formatReply(
			text,
			localGuard.intent === 'fallback' ? source : localGuard.intent,
			source,
			false,
			context.userName,
		);
	} catch (error) {
		console.error('[bon-chat] AI providers failed:', error);
		return formatReply(
			localGuard.text,
			localGuard.intent,
			'local',
			false,
			localGuard.userName ?? context.userName,
		);
	}
};
