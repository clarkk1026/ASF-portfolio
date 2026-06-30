import type { BotContext } from './ai-bot-responses.js';

type HistoryItem = {
	role: 'user' | 'assistant';
	content: string;
};

export const extractVisitorName = (input: string): string | undefined => {
	const match = input.match(/(?:i'm|i am|my name is|call me)\s+([a-z]{2,20})/i);
	if (!match?.[1]) return undefined;

	const name = match[1];
	return name[0].toUpperCase() + name.slice(1).toLowerCase();
};

const summarizeHistory = (history: HistoryItem[]) => {
	const recent = history.slice(-6);
	if (recent.length === 0) return 'First message in this chat.';

	return recent
		.map((item) => {
			const speaker = item.role === 'user' ? 'Visitor' : 'Bon';
			const text = item.content.trim().replace(/\s+/g, ' ').slice(0, 140);
			return `- ${speaker}: ${text}${item.content.length > 140 ? '…' : ''}`;
		})
		.join('\n');
};

export const buildVisitorTurnContext = (
	message: string,
	context: BotContext,
	history: HistoryItem[] = [],
) => {
	const lines = [
		'SESSION CONTEXT (use this to stay personal and consistent):',
		context.userName
			? `- Visitor name: ${context.userName} (use it naturally, not every sentence)`
			: '- Visitor name: unknown (only ask if it feels natural)',
		`- Turn number: ${context.turn + 1}`,
		context.lastIntent
			? `- Last topic you discussed: ${context.lastIntent}`
			: '- Last topic: none yet',
		'',
		'Recent conversation:',
		summarizeHistory(history),
		'',
		'REPLY RULES FOR THIS MESSAGE:',
		'- Answer the exact question or feeling in the visitor message below.',
		'- Do not dump unrelated facts about Ben unless they asked for them.',
		'- If this is a follow-up, connect to what was said earlier.',
		'- Match their tone: short if they are short, detailed if they want depth.',
		'- Be honest. If you are unsure, say so. Never invent facts.',
		'',
		`Visitor message: ${message}`,
	];

	return lines.join('\n');
};
