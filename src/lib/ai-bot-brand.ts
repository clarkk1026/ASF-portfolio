export const BOT_NAME = 'Bon';
export const BOT_SUBTITLE = 'AI BEN';

export const BOT_MOODS = [
	'happy',
	'sad',
	'shy',
	'angry',
	'playful',
	'smile',
	'shocked',
	'excited',
	'calm',
	'sorry',
	'thoughtful',
	'warm',
	'annoyed',
	'curious',
	'proud',
	'embarrassed',
] as const;

export type BotMood = (typeof BOT_MOODS)[number];

export const botGreeting = `Hey! I'm **Bon**. I know Ben's work inside out, and I talk like a real person, not a help desk. Ask about his skills, story, projects, or just say what's on your mind.

[[mood:smile]]`;

const MOOD_TAG = new RegExp(
	`\\[\\[mood:(${BOT_MOODS.join('|')})\\]\\]`,
	'i',
);

export const hasBotMoodTag = (text: string) => MOOD_TAG.test(text);

export const resolveMoodFromIntent = (intent: string): BotMood => {
	const map: Record<string, BotMood> = {
		empty: 'warm',
		too_long: 'shy',
		rate_limit: 'annoyed',
		greeting: 'smile',
		thanks: 'happy',
		bye: 'warm',
		help: 'curious',
		identity: 'calm',
		experience: 'thoughtful',
		education: 'calm',
		projects: 'excited',
		skills: 'proud',
		tech: 'curious',
		shopify: 'excited',
		ai: 'excited',
		story: 'thoughtful',
		about: 'warm',
		contact: 'warm',
		availability: 'happy',
		location: 'calm',
		github_locked: 'sorry',
		impolite: 'angry',
		blocked_topic: 'annoyed',
		mood_check: 'smile',
		feelings: 'sorry',
		wellness: 'warm',
		music: 'happy',
		play: 'playful',
		joke: 'playful',
		nonsense: 'shocked',
		casual: 'warm',
		positive: 'happy',
		clarify: 'curious',
		site: 'calm',
		gemini: 'thoughtful',
	};

	return map[intent] ?? 'calm';
};

export const BOT_MOOD_LABEL: Record<BotMood, string> = {
	happy: 'Happy',
	sad: 'Sad',
	shy: 'Shy',
	angry: 'Annoyed',
	playful: 'Cheeky',
	smile: 'Smiling',
	shocked: 'Shocked',
	excited: 'Excited',
	calm: 'Calm',
	sorry: 'Sorry',
	thoughtful: 'Thoughtful',
	warm: 'Warm',
	annoyed: 'Irritated',
	curious: 'Curious',
	proud: 'Proud',
	embarrassed: 'Embarrassed',
};

export const BOT_MOOD_COLOR: Record<BotMood, string> = {
	happy: 'rgb(251, 191, 36)',
	sad: 'rgb(120, 160, 255)',
	shy: 'rgb(168, 130, 255)',
	angry: 'rgb(248, 113, 113)',
	playful: 'rgb(244, 114, 182)',
	smile: 'rgb(252, 211, 77)',
	shocked: 'rgb(251, 146, 60)',
	excited: 'rgb(31, 195, 255)',
	calm: 'rgb(74, 222, 128)',
	sorry: 'rgb(148, 163, 184)',
	thoughtful: 'rgb(120, 160, 255)',
	warm: 'rgb(160, 220, 255)',
	annoyed: 'rgb(239, 68, 68)',
	curious: 'rgb(56, 189, 248)',
	proud: 'rgb(167, 139, 250)',
	embarrassed: 'rgb(251, 191, 36)',
};

export const parseBotMood = (
	text: string,
): { text: string; mood: BotMood } => {
	const match = text.match(MOOD_TAG);
	if (!match) {
		return { text: text.trim(), mood: 'calm' };
	}

	const mood = match[1].toLowerCase() as BotMood;
	return {
		text: text.replace(MOOD_TAG, '').trim(),
		mood: BOT_MOODS.includes(mood) ? mood : 'calm',
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
