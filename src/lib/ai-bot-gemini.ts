import { buildBotSystemPrompt } from './ai-bot-context.js';
import type { BotContext } from './ai-bot-responses.js';
import { buildVisitorSessionNotes } from './ai-bot-visitor-context.js';

export type GeminiHistoryMessage = {
	role: 'user' | 'assistant';
	content: string;
};

const DEFAULT_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-flash-latest'] as const;
const MAX_TOKENS = 768;
const TEMPERATURE = 0.7;

const isNonRetryableGeminiError = (error: Error) =>
	/FAILED_PRECONDITION|not supported for the API|location|401|403|API_KEY/i.test(
		error.message,
	);

const toGeminiRole = (role: 'user' | 'assistant'): 'user' | 'model' =>
	role === 'assistant' ? 'model' : 'user';

const requestGemini = async (
	apiKey: string,
	model: string,
	systemPrompt: string,
	contents: { role: 'user' | 'model'; parts: { text: string }[] }[],
) => {
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
					parts: [{ text: systemPrompt }],
				},
				contents,
				generationConfig: {
					temperature: TEMPERATURE,
					maxOutputTokens: MAX_TOKENS,
					topP: 0.92,
				},
			}),
		},
	);

	if (!response.ok) {
		const detail = await response.text();
		throw new Error(`Gemini ${model} failed (${response.status}): ${detail}`);
	}

	const payload = (await response.json()) as {
		candidates?: { content?: { parts?: { text?: string }[] } }[];
	};

	const text = payload.candidates?.[0]?.content?.parts
		?.map((part) => part.text ?? '')
		.join('')
		.trim();

	if (!text) {
		throw new Error(`Gemini ${model} returned an empty response`);
	}

	return text;
};

export const callGeminiChat = async (
	apiKey: string,
	userMessage: string,
	history: GeminiHistoryMessage[],
	context: BotContext,
	model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL,
) => {
	const sessionNotes = buildVisitorSessionNotes(context);
	const systemPrompt = sessionNotes
		? `${buildBotSystemPrompt()}\n\n${sessionNotes}`
		: buildBotSystemPrompt();

	const contents = [
		...history.slice(-12).map((item) => ({
			role: toGeminiRole(item.role),
			parts: [{ text: item.content }],
		})),
		{ role: 'user' as const, parts: [{ text: userMessage }] },
	];

	const models = [model, ...FALLBACK_MODELS.filter((candidate) => candidate !== model)];
	let lastError: Error | null = null;

	for (const candidate of models) {
		try {
			return await requestGemini(apiKey, candidate, systemPrompt, contents);
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			// Region / auth failures won't recover on another Gemini model — fail fast.
			if (isNonRetryableGeminiError(lastError)) break;
		}
	}

	throw lastError ?? new Error('Gemini request failed');
};
