import { buildBotSystemPrompt } from './ai-bot-context.js';
import type { BotContext } from './ai-bot-responses.js';
import { buildVisitorTurnContext } from './ai-bot-visitor-context.js';

export type GeminiHistoryMessage = {
	role: 'user' | 'assistant';
	content: string;
};

type GeminiHistoryItem = {
	role: 'user' | 'assistant';
	content: string;
};

const DEFAULT_MODEL = 'gemini-2.0-flash';
const MAX_TOKENS = 768;
const TEMPERATURE = 0.68;

const toGeminiRole = (role: 'user' | 'assistant'): 'user' | 'model' =>
	role === 'assistant' ? 'model' : 'user';

export const callGeminiChat = async (
	apiKey: string,
	userMessage: string,
	history: GeminiHistoryMessage[],
	context: BotContext,
	model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL,
) => {
	const contextualMessage = buildVisitorTurnContext(
		userMessage,
		context,
		history as GeminiHistoryItem[],
	);

	const contents = [
		...history.slice(-14).map((item) => ({
			role: toGeminiRole(item.role),
			parts: [{ text: item.content }],
		})),
		{ role: 'user' as const, parts: [{ text: contextualMessage }] },
	];

	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-goog-api-key': apiKey,
			},
			body: JSON.stringify({
				system_instruction: {
					parts: [{ text: buildBotSystemPrompt() }],
				},
				contents,
				generationConfig: {
					temperature: TEMPERATURE,
					maxOutputTokens: MAX_TOKENS,
					topP: 0.9,
				},
			}),
		},
	);

	if (!response.ok) {
		const detail = await response.text();
		throw new Error(`Gemini request failed (${response.status}): ${detail}`);
	}

	const payload = (await response.json()) as {
		candidates?: { content?: { parts?: { text?: string }[] } }[];
	};

	const text = payload.candidates?.[0]?.content?.parts
		?.map((part) => part.text ?? '')
		.join('')
		.trim();

	if (!text) {
		throw new Error('Gemini returned an empty response');
	}

	return text;
};
