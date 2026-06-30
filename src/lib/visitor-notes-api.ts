import {
	normalizeStore,
	withCounts,
	type VisitorNotePayload,
	type VisitorNotesResponse,
	type VisitorPostPayload,
	type VisitorVoteCancelPayload,
	type VisitorVoteChangePayload,
	type VisitorVotePayload,
} from './visitor-notes-types';
import type { VisitorNoteSentiment } from '../data/portfolio';

const API_PATH = '/api/visitor-notes';

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

	return {
		...withCounts(normalizeStore(raw)),
		livePersistent,
		storageMode,
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

	if (!res.ok) {
		const err = (await res.json().catch(() => null)) as { error?: string } | null;
		throw new Error(err?.error ?? 'Request failed');
	}

	return parseResponse(res);
};

export const fetchVisitorNotes = async (): Promise<VisitorNotesResponse> => {
	const res = await fetch(API_PATH, { cache: 'no-store' });
	if (!res.ok) {
		throw new Error('Could not load live visitor counts.');
	}

	return parseResponse(res);
};

export const submitVisitorVote = async (
	sentiment: VisitorNoteSentiment,
): Promise<VisitorNotesResponse> => {
	const payload: VisitorVotePayload = { type: 'vote', sentiment };
	return postPayload(payload);
};

export const changeVisitorVote = async (
	from: VisitorNoteSentiment,
	to: VisitorNoteSentiment,
): Promise<VisitorNotesResponse> => {
	if (from === to) {
		return fetchVisitorNotes();
	}

	const payload: VisitorVoteChangePayload = { type: 'vote-change', from, to };
	return postPayload(payload);
};

export const cancelVisitorVote = async (
	sentiment: VisitorNoteSentiment,
): Promise<VisitorNotesResponse> => {
	const payload: VisitorVoteCancelPayload = { type: 'vote-cancel', sentiment };
	return postPayload(payload);
};

export const submitVisitorNote = async (
	payload: Omit<VisitorNotePayload, 'type'>,
): Promise<VisitorNotesResponse> => {
	const body: VisitorNotePayload = { type: 'note', ...payload };
	return postPayload(body);
};
