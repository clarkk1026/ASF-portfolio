import { buildBotSystemPrompt } from './ai-bot-context.js';

export type GroqHistoryMessage = {
	role: 'user' | 'assistant';
	content: string;
};

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const MAX_TOKENS = 768;
const TEMPERATURE = 0.7;

export const callGroqChat = async (
	apiKey: string,
	userMessage: string,
	history: GroqHistoryMessage[],
	systemPrompt = buildBotSystemPrompt(),
	model = process.env.GROQ_MODEL ?? DEFAULT_MODEL,
) => {
	const messages = [
		{ role: 'system' as const, content: systemPrompt },
		...history.slice(-12).map((item) => ({
			role: item.role,
			content: item.content,
		})),
		{ role: 'user' as const, content: userMessage },
	];

	const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model,
			messages,
			temperature: TEMPERATURE,
			max_tokens: MAX_TOKENS,
		}),
	});

	if (!response.ok) {
		const detail = await response.text();
		throw new Error(`Groq request failed (${response.status}): ${detail}`);
	}

	const payload = (await response.json()) as {
		choices?: { message?: { content?: string } }[];
	};

	const text = payload.choices?.[0]?.message?.content?.trim();
	if (!text) {
		throw new Error('Groq returned an empty response');
	}

	return text;
};
