import { buildBotSystemPrompt } from './ai-bot-context';

export type GroqChatMessage = {
	role: 'system' | 'user' | 'assistant';
	content: string;
};

const DEFAULT_MODEL = 'llama-3.1-8b-instant';
const MAX_TOKENS = 320;
const TEMPERATURE = 0.55;

export const callGroqChat = async (
	apiKey: string,
	userMessage: string,
	history: GroqChatMessage[],
	model = process.env.GROQ_MODEL ?? DEFAULT_MODEL,
) => {
	const messages: GroqChatMessage[] = [
		{ role: 'system', content: buildBotSystemPrompt() },
		...history.slice(-10),
		{ role: 'user', content: userMessage },
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
