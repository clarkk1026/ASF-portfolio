import { isValidVisitorId } from './visitor-notes-types';
import {
	isVisitorContactChannel,
	type VisitorContactChannel,
	type VisitorContactPayload,
} from './visitor-contact-types';

const API_PATH = '/api/visitor-contacts';
const VISITOR_ID_KEY = 'portfolio-visitor-id';

const getVisitorId = (): string => {
	let id = localStorage.getItem(VISITOR_ID_KEY);
	if (!id || !isValidVisitorId(id)) {
		id = crypto.randomUUID();
		localStorage.setItem(VISITOR_ID_KEY, id);
	}
	return id;
};

export type SubmitVisitorContactInput = {
	name: string;
	channel: VisitorContactChannel;
	value: string;
	note?: string;
};

export const submitVisitorContact = async (
	input: SubmitVisitorContactInput,
): Promise<{ ok: true; updated: boolean; message: string }> => {
	if (!isVisitorContactChannel(input.channel)) {
		throw new Error('Choose a contact type.');
	}

	const payload: VisitorContactPayload = {
		visitorId: getVisitorId(),
		name: input.name,
		channel: input.channel,
		value: input.value,
		note: input.note ?? '',
	};

	const response = await fetch(API_PATH, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
		cache: 'no-store',
	});

	const data = (await response.json()) as {
		ok?: boolean;
		updated?: boolean;
		message?: string;
		error?: string;
	};

	if (!response.ok) {
		throw new Error(data.error ?? 'Could not save contact info.');
	}

	return {
		ok: true,
		updated: Boolean(data.updated),
		message: data.message ?? 'Thanks! Your contact info was saved.',
	};
};
