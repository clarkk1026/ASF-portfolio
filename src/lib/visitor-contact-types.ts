export const VISITOR_CONTACT_CHANNELS = [
	'whatsapp',
	'telegram',
	'email',
	'discord',
	'phone',
	'linkedin',
	'other',
] as const;

export type VisitorContactChannel = (typeof VISITOR_CONTACT_CHANNELS)[number];

export type VisitorContactEntry = {
	id: string;
	visitorId: string;
	name: string;
	channel: VisitorContactChannel;
	value: string;
	note: string;
	createdAt: string;
};

export type VisitorContactsStore = {
	contacts: VisitorContactEntry[];
};

export type VisitorContactPayload = {
	visitorId: string;
	name: string;
	channel: VisitorContactChannel;
	value: string;
	note?: string;
};

export const isVisitorContactChannel = (
	value: unknown,
): value is VisitorContactChannel =>
	typeof value === 'string' &&
	(VISITOR_CONTACT_CHANNELS as readonly string[]).includes(value);

export const normalizeContactName = (value: string) =>
	value.trim().replace(/\s+/g, ' ').slice(0, 64);

export const normalizeContactValue = (value: string) =>
	value.trim().replace(/\s+/g, ' ').slice(0, 160);

export const normalizeContactNote = (value: string) =>
	value.trim().replace(/\s+/g, ' ').slice(0, 400);

export const emptyContactStore = (): VisitorContactsStore => ({ contacts: [] });

export const normalizeContactStore = (
	raw: unknown,
): VisitorContactsStore => {
	if (!raw || typeof raw !== 'object') return emptyContactStore();
	const contacts = Array.isArray((raw as VisitorContactsStore).contacts)
		? (raw as VisitorContactsStore).contacts
		: [];

	return {
		contacts: contacts
			.filter(
				(item) =>
					item &&
					typeof item === 'object' &&
					typeof item.id === 'string' &&
					typeof item.visitorId === 'string' &&
					typeof item.name === 'string' &&
					isVisitorContactChannel(item.channel) &&
					typeof item.value === 'string' &&
					typeof item.createdAt === 'string',
			)
			.map((item) => ({
				id: item.id,
				visitorId: item.visitorId,
				name: normalizeContactName(item.name),
				channel: item.channel,
				value: normalizeContactValue(item.value),
				note:
					typeof item.note === 'string'
						? normalizeContactNote(item.note)
						: '',
				createdAt: item.createdAt,
			})),
	};
};
