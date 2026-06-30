import { personal } from '../data/portfolio';

export const discordContactHref = personal.discordUserId
	? `https://discord.com/users/${personal.discordUserId}`
	: 'https://discord.com/channels/@me';

export const openDiscordContact = (
	event?: { preventDefault: () => void },
	onNotify?: (message: string) => void,
) => {
	if (personal.discordUserId) return;

	event?.preventDefault();

	const usernameMessage = `Discord: ${personal.discordUsername}`;

	if (navigator.clipboard?.writeText) {
		void navigator.clipboard.writeText(personal.discordUsername).then(
			() =>
				onNotify?.(
					`Discord username copied: ${personal.discordUsername}`,
				),
			() => onNotify?.(usernameMessage),
		);
	} else {
		onNotify?.(usernameMessage);
	}

	window.open(
		'https://discord.com/channels/@me',
		'_blank',
		'noopener,noreferrer',
	);
};
