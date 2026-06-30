import {
	hasBotMoodTag,
	parseBotMood,
	resolveMoodFromIntent,
	stripGithubFromReply,
	type BotMood,
} from './ai-bot-brand.js';
import { getBotResponse, type BotContext } from './ai-bot-responses.js';
import { callGroqChat, type GroqChatMessage } from './ai-bot-groq.js';
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

export type ChatResponseBody = {
	text: string;
	intent: string;
	source: 'groq' | 'local';
	mood?: BotMood;
	showGithubAlert?: boolean;
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

const toGroqHistory = (history: ChatHistoryItem[] = []): GroqChatMessage[] =>
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

const formatReply = (
	rawText: string,
	intent: string,
	source: 'groq' | 'local',
	showGithubAlert = false,
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
	};
};

export const handleChatRequest = async (
	body: ChatRequestBody,
	apiKey: string | undefined,
	clientKey: string,
): Promise<ChatResponseBody> => {
	const message = body.message?.trim() ?? '';
	const context: BotContext = body.context ?? { lastIntent: null, turn: 0 };

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
		return formatReply(localGuard.text, localGuard.intent, 'local');
	}

	if (!apiKey) {
		return formatReply(localGuard.text, localGuard.intent, 'local');
	}

	try {
		const rawText = await callGroqChat(
			apiKey,
			message,
			toGroqHistory(body.history),
		);

		return formatReply(rawText, 'groq', 'groq');
	} catch {
		return formatReply(localGuard.text, localGuard.intent, 'local');
	}
};
