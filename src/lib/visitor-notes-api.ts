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
const VISITOR_ID_KEY = 'portfolio-visitor-id';

export const getVisitorId = (): string => {
	let id = localStorage.getItem(VISITOR_ID_KEY);
	if (!id) {
		id = crypto.randomUUID();
		localStorage.setItem(VISITOR_ID_KEY, id);
	}
	return id;
};

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
	const actionCount =
		typeof raw.actionCount === 'number' ? raw.actionCount : undefined;
	const voteLocked =
		typeof raw.voteLocked === 'boolean' ? raw.voteLocked : undefined;
	const actionsRemaining =
		typeof raw.actionsRemaining === 'number' ? raw.actionsRemaining : undefined;

	return {
		...withCounts(normalizeStore(raw)),
		livePersistent,
		storageMode,
		yourVote,
		actionCount,
		voteLocked,
		actionsRemaining,
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

	return data;
};

export const fetchVisitorNotes = async (): Promise<VisitorNotesResponse> => {
	const visitorId = getVisitorId();
	const res = await fetch(`${API_PATH}?visitorId=${encodeURIComponent(visitorId)}`, {
		cache: 'no-store',
	});
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
	_from: VisitorNoteSentiment,
	to: VisitorNoteSentiment,
): Promise<VisitorNotesResponse> => {
	const payload: VisitorVoteChangePayload = {
		type: 'vote-change',
		visitorId: getVisitorId(),
		from: _from,
		to,
	};
	return postPayload(payload);
};

export const cancelVisitorVote = async (): Promise<VisitorNotesResponse> => {
	const payload: VisitorVoteCancelPayload = {
		type: 'vote-cancel',
		visitorId: getVisitorId(),
	};
	return postPayload(payload);
};

export const submitVisitorNote = async (
	payload: Omit<VisitorNotePayload, 'type' | 'visitorId'>,
): Promise<VisitorNotesResponse> => {
	const body: VisitorNotePayload = {
		type: 'note',
		visitorId: getVisitorId(),
		...payload,
	};
	return postPayload(body);
};
