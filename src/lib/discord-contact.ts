import { personal } from '../data/portfolio';

export const discordContactHref = personal.discordUserId
	? `https://discord.com/users/${personal.discordUserId}`
	: 'https://discord.com/channels/@me';

export const openDiscordContact = (
	event?: { preventDefault: () => void },
) => {
	if (personal.discordUserId) return;

	event?.preventDefault();
	void navigator.clipboard.writeText(personal.discordUsername);
	window.open('https://discord.com/channels/@me', '_blank', 'noopener,noreferrer');
};
