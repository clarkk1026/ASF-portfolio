import {
	isValidVisitorId,
	normalizeStore,
	normalizeNoteName,
	withCounts,
	type VisitorNotePayload,
	type VisitorNotesResponse,
	type VisitorPostPayload,
	type VisitorVoteChangePayload,
	type VisitorVotePayload,
} from './visitor-notes-types';
import type { VisitorNoteSentiment } from '../data/portfolio';

const API_PATH = '/api/visitor-notes';
const VISITOR_ID_KEY = 'portfolio-visitor-id';

export const getVisitorId = (): string => {
	let id = localStorage.getItem(VISITOR_ID_KEY);
	if (!id || !isValidVisitorId(id)) {
		id = crypto.randomUUID();
		localStorage.setItem(VISITOR_ID_KEY, id);
	}
	return id;
};

const parseResponse = async (
	res: Response,
): Promise<VisitorNotesResponse & { error?: string }> => {
	let raw: Record<string, unknown>;
	try {
		raw = (await res.json()) as Record<string, unknown>;
	} catch {
		throw new Error(res.statusText || 'Request failed');
	}

	const error = typeof raw.error === 'string' ? raw.error : undefined;
	const visitorId =
		typeof raw.visitorId === 'string' && isValidVisitorId(raw.visitorId)
			? raw.visitorId
			: getVisitorId();

	return {
		...withCounts(normalizeStore(raw), visitorId),
		livePersistent:
			typeof raw.livePersistent === 'boolean' ? raw.livePersistent : undefined,
		storageMode:
			raw.storageMode === 'kv' ||
			raw.storageMode === 'blob' ||
			raw.storageMode === 'memory'
				? raw.storageMode
				: undefined,
		error,
	};
};

const postPayload = async (
	body: VisitorPostPayload,
): Promise<VisitorNotesResponse> => {
	const res = await fetch(API_PATH, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		cache: 'no-store',
	});

	const data = await parseResponse(res);

	if (!res.ok) {
		throw new Error(data.error ?? 'Request failed');
	}

	return data;
};

export const fetchVisitorNotes = async (): Promise<VisitorNotesResponse> => {
	const visitorId = getVisitorId();
	const res = await fetch(
		`${API_PATH}?visitorId=${encodeURIComponent(visitorId)}`,
		{ cache: 'no-store' },
	);
	if (!res.ok) {
		throw new Error('Could not load live visitor counts.');
	}

	return parseResponse(res);
};

export const submitVisitorVote = async (
	sentiment: VisitorNoteSentiment,
): Promise<VisitorNotesResponse> => {
	const payload: VisitorVotePayload = {
		type: 'vote',
		visitorId: getVisitorId(),
		sentiment,
	};
	return postPayload(payload);
};

export const changeVisitorVote = async (
	to: VisitorNoteSentiment,
): Promise<VisitorNotesResponse> => {
	const payload: VisitorVoteChangePayload = {
		type: 'vote-change',
		visitorId: getVisitorId(),
		to,
	};
	return postPayload(payload);
};

export const submitVisitorNote = async (
	payload: Omit<VisitorNotePayload, 'type' | 'visitorId'>,
): Promise<VisitorNotesResponse> => {
	const name = normalizeNoteName(payload.name);
	if (!name) {
		throw new Error('Enter your name when leaving a note.');
	}

	const body: VisitorNotePayload = {
		type: 'note',
		visitorId: getVisitorId(),
		sentiment: payload.sentiment,
		name,
		message: payload.message.trim(),
	};
	return postPayload(body);
};
