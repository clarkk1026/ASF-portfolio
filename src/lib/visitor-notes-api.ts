import {
	normalizeStore,
	normalizeUserKey,
	withCounts,
	type VisitorNotePayload,
	type VisitorNotesResponse,
	type VisitorPostPayload,
	type VisitorVoteChangePayload,
	type VisitorVotePayload,
} from './visitor-notes-types';
import type { VisitorNoteSentiment } from '../data/portfolio';

const API_PATH = '/api/visitor-notes';
const USER_KEY_STORAGE = 'portfolio-visitor-user-key';

export const getStoredUserKey = (): string | null => {
	const stored = localStorage.getItem(USER_KEY_STORAGE);
	return stored && stored.trim() ? stored : null;
};

export const storeUserKey = (userKey: string) => {
	localStorage.setItem(USER_KEY_STORAGE, userKey);
};

export const buildUserKey = (name: string): string | null => normalizeUserKey(name);

const parseResponse = async (res: Response): Promise<VisitorNotesResponse> => {
	const raw = (await res.json()) as Record<string, unknown>;
	const livePersistent =
		typeof raw.livePersistent === 'boolean' ? raw.livePersistent : undefined;
	const storageMode =
		raw.storageMode === 'kv' ||
		raw.storageMode === 'blob' ||
		raw.storageMode === 'memory'
			? raw.storageMode
			: undefined;
	const yourVote =
		raw.yourVote === 'support' ||
		raw.yourVote === 'disagree' ||
		raw.yourVote === 'not-care'
			? raw.yourVote
			: raw.yourVote === null
				? null
				: undefined;
	const hasApplied =
		typeof raw.hasApplied === 'boolean' ? raw.hasApplied : undefined;
	const canEdit = typeof raw.canEdit === 'boolean' ? raw.canEdit : undefined;
	const yourReplyId =
		typeof raw.yourReplyId === 'string'
			? raw.yourReplyId
			: raw.yourReplyId === null
				? null
				: undefined;
	const userKey =
		typeof raw.userKey === 'string'
			? raw.userKey
			: raw.userKey === null
				? null
				: undefined;

	return {
		...withCounts(normalizeStore(raw)),
		livePersistent,
		storageMode,
		yourVote,
		hasApplied,
		canEdit,
		yourReplyId,
		userKey,
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
		throw new Error(
			(data as unknown as { error?: string }).error ?? 'Request failed',
		);
	}

	if (data.userKey) {
		storeUserKey(data.userKey);
	}

	return data;
};

export const fetchVisitorNotes = async (): Promise<VisitorNotesResponse> => {
	const userKey = getStoredUserKey();
	const url = userKey
		? `${API_PATH}?userKey=${encodeURIComponent(userKey)}`
		: API_PATH;
	const res = await fetch(url, { cache: 'no-store' });
	if (!res.ok) {
		throw new Error('Could not load live visitor counts.');
	}

	const data = await parseResponse(res);
	if (data.userKey) {
		storeUserKey(data.userKey);
	}
	return data;
};

export const submitVisitorVote = async (
	sentiment: VisitorNoteSentiment,
	name: string,
): Promise<VisitorNotesResponse> => {
	const userKey = buildUserKey(name);
	if (!userKey) {
		throw new Error('Enter your name to apply. One response per person.');
	}

	const payload: VisitorVotePayload = {
		type: 'vote',
		userKey,
		sentiment,
		name: name.trim(),
	};
	return postPayload(payload);
};

export const changeVisitorVote = async (
	_from: VisitorNoteSentiment,
	to: VisitorNoteSentiment,
	name: string,
): Promise<VisitorNotesResponse> => {
	const userKey = getStoredUserKey() ?? buildUserKey(name);
	if (!userKey) {
		throw new Error('Enter your name to save changes.');
	}

	const payload: VisitorVoteChangePayload = {
		type: 'vote-change',
		userKey,
		from: _from,
		to,
		name: name.trim(),
	};
	return postPayload(payload);
};

export const submitVisitorNote = async (
	payload: Omit<VisitorNotePayload, 'type' | 'userKey'>,
): Promise<VisitorNotesResponse> => {
	const userKey = getStoredUserKey() ?? buildUserKey(payload.name);
	if (!userKey) {
		throw new Error('Enter your name to leave a note.');
	}

	const body: VisitorNotePayload = {
		type: 'note',
		userKey,
		sentiment: payload.sentiment,
		name: payload.name.trim(),
		message: payload.message,
	};
	return postPayload(body);
};
