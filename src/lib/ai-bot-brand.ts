export const BOT_NAME = 'Bon';
export const BOT_SUBTITLE = 'AI BEN';

export const botGreeting = `Hey — I'm **Bon** (AI BEN). I know Ben's work inside out, but I'm also happy to chat like a real person — music, wellbeing, random thoughts, whatever. Ask about his skills, story, or just say hi.

[[mood:happy]]`;

export type BotMood =
	| 'happy'
	| 'shy'
	| 'sad'
	| 'excited'
	| 'calm'
	| 'sorry'
	| 'thoughtful'
	| 'warm';

const MOOD_TAG =
	/\[\[mood:(happy|shy|sad|excited|calm|sorry|thoughtful|warm)\]\]\s*$/i;

export const BOT_MOOD_LABEL: Record<BotMood, string> = {
	happy: 'Happy',
	shy: 'Shy',
	sad: 'Reflective',
	excited: 'Excited',
	calm: 'Calm',
	sorry: 'Apologetic',
	thoughtful: 'Thoughtful',
	warm: 'Warm',
};

export const BOT_MOOD_COLOR: Record<BotMood, string> = {
	happy: 'rgb(251, 191, 36)',
	shy: 'rgb(168, 130, 255)',
	sad: 'rgb(148, 163, 184)',
	excited: 'rgb(31, 195, 255)',
	calm: 'rgb(74, 222, 128)',
	sorry: 'rgb(251, 191, 36)',
	thoughtful: 'rgb(120, 160, 255)',
	warm: 'rgb(160, 220, 255)',
};

export const parseBotMood = (
	text: string,
): { text: string; mood: BotMood } => {
	const match = text.match(MOOD_TAG);
	if (!match) {
		return { text: text.trim(), mood: 'calm' };
	}

	return {
		text: text.replace(MOOD_TAG, '').trim(),
		mood: match[1].toLowerCase() as BotMood,
	};
};

export const stripGithubFromReply = (text: string) =>
	text
		.replace(/\[([^\]]+)\]\(https?:\/\/github\.com[^)]+\)/gi, '$1')
		.replace(/https?:\/\/github\.com\S*/gi, '')
		.replace(/github\.com\/\S*/gi, '')
		.replace(/^\s*[-*•]?\s*\*?\*?GitHub\*?\*?:?[^\n]*\n?/gim, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
