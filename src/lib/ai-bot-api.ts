import type { BotContext, BotMessage } from './ai-bot-responses';
import type { ChatResponseBody } from './ai-bot-chat-handler';

const toHistory = (messages: BotMessage[]) =>
	messages
		.filter((msg) => msg.role === 'user' || msg.role === 'bot')
		.map((msg) => ({
			role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
			content: msg.text,
		}));

export const fetchBotReply = async (
	message: string,
	messages: BotMessage[],
	context: BotContext,
): Promise<ChatResponseBody> => {
	const response = await fetch('/api/chat', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			message,
			history: toHistory(messages),
			context,
		}),
	});

	if (!response.ok) {
		throw new Error('Chat request failed');
	}

	return response.json() as Promise<ChatResponseBody>;
};
