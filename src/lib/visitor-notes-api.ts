import {
	decrementVote,
	emptyStore,
	incrementVote,
	normalizeStore,
	withCounts,
	type VisitorNotePayload,
	type VisitorNotesResponse,
	type VisitorNotesStore,
	type VisitorPostPayload,
	type VisitorVoteCancelPayload,
	type VisitorVoteChangePayload,
	type VisitorVotePayload,
} from './visitor-notes-types';
import type { VisitorNoteSentiment } from '../data/portfolio';

const API_PATH = '/api/visitor-notes';
const STORAGE_KEY = 'portfolio-visitor-notes';

const readLocalStore = (): VisitorNotesStore => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return emptyStore();
		return normalizeStore(JSON.parse(raw));
	} catch {
		return emptyStore();
	}
};

const writeLocalStore = (store: VisitorNotesStore) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const createReply = (payload: VisitorNotePayload) => ({
	id: crypto.randomUUID(),
	sentiment: payload.sentiment,
	name: payload.name?.trim() || 'Anonymous',
	message: payload.message.trim(),
	createdAt: new Date().toISOString(),
});

const postPayload = async (
	body: VisitorPostPayload,
): Promise<VisitorNotesResponse> => {
	const res = await fetch(API_PATH, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});

	if (res.ok) {
		return withCounts(normalizeStore(await res.json()));
	}

	const err = (await res.json().catch(() => null)) as { error?: string } | null;
	throw new Error(err?.error ?? 'Request failed');
};

const withLocalFallback = async (
	body: VisitorPostPayload,
	apply: (store: VisitorNotesStore) => void,
): Promise<VisitorNotesResponse> => {
	try {
		return await postPayload(body);
	} catch (error) {
		if (error instanceof Error && error.message === 'Request failed') {
			throw error;
		}

		const store = readLocalStore();
		apply(store);
		writeLocalStore(store);
		return withCounts(store);
	}
};

export const fetchVisitorNotes = async (): Promise<VisitorNotesResponse> => {
	try {
		const res = await fetch(API_PATH);
		if (!res.ok) throw new Error('fetch failed');
		return withCounts(normalizeStore(await res.json()));
	} catch {
		return withCounts(readLocalStore());
	}
};

export const submitVisitorVote = async (
	sentiment: VisitorNoteSentiment,
): Promise<VisitorNotesResponse> => {
	const payload: VisitorVotePayload = { type: 'vote', sentiment };
	return withLocalFallback(payload, (store) => incrementVote(store, sentiment));
};

export const changeVisitorVote = async (
	from: VisitorNoteSentiment,
	to: VisitorNoteSentiment,
): Promise<VisitorNotesResponse> => {
	if (from === to) {
		return withCounts(readLocalStore());
	}

	const payload: VisitorVoteChangePayload = { type: 'vote-change', from, to };
	return withLocalFallback(payload, (store) => {
		decrementVote(store, from);
		incrementVote(store, to);
	});
};

export const cancelVisitorVote = async (
	sentiment: VisitorNoteSentiment,
): Promise<VisitorNotesResponse> => {
	const payload: VisitorVoteCancelPayload = { type: 'vote-cancel', sentiment };
	return withLocalFallback(payload, (store) => decrementVote(store, sentiment));
};

export const submitVisitorNote = async (
	payload: Omit<VisitorNotePayload, 'type'>,
): Promise<VisitorNotesResponse> => {
	const body: VisitorNotePayload = { type: 'note', ...payload };
	return withLocalFallback(body, (store) => {
		store.replies.unshift(createReply(body));
		store.replies = store.replies.slice(0, 200);
	});
};
