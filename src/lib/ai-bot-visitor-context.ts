import type { BotContext } from './ai-bot-responses.js';

export const extractVisitorName = (input: string): string | undefined => {
	const match = input.match(/(?:i'm|i am|my name is|call me)\s+([a-z]{2,20})/i);
	if (!match?.[1]) return undefined;

	const name = match[1];
	return name[0].toUpperCase() + name.slice(1).toLowerCase();
};

export const buildVisitorSessionNotes = (context: BotContext) => {
	const lines: string[] = [];

	if (context.userName) {
		lines.push(`Visitor name: ${context.userName} (use naturally)`);
	}

	if (context.lastIntent) {
		lines.push(`Previous topic: ${context.lastIntent}`);
	}

	lines.push(`Conversation turn: ${context.turn + 1}`);
	lines.push(
		'Answer the visitor message directly. Stay personal, honest, and specific. Do not agree with nonsense.',
	);

	return `CURRENT SESSION:\n${lines.join('\n')}`;
};
