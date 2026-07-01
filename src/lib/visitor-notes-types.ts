import type { VisitorNoteSentiment } from '../data/portfolio.js';

/** Initial apply + 2 status changes */
export const MAX_VOTE_ACTIONS = 3;
/** Initial post + 1 note edit */
export const MAX_NOTE_ACTIONS = 2;

export type VisitorReply = {
	id: string;
	sentiment: VisitorNoteSentiment;
	name: string;
	message: string;
	createdAt: string;
};

export type VisitorVoteCounts = {
	support: number;
	disagree: number;
	notCare: number;
};

export type VisitorSession = {
	sentiment: VisitorNoteSentiment | null;
	voteActionCount: number;
	noteActionCount: number;
	replyId: string | null;
	displayName: string;
};

export type VisitorNotesStore = {
	votes: VisitorVoteCounts;
	replies: VisitorReply[];
	sessions: Record<string, VisitorSession>;
};

export type VisitorNotesResponse = VisitorNotesStore & {
	supportCount: number;
	disagreeCount: number;
	notCareCount: number;
	livePersistent?: boolean;
	storageMode?: 'kv' | 'blob' | 'memory';
	yourVote?: VisitorNoteSentiment | null;
	hasApplied?: boolean;
	canEdit?: boolean;
	canChangeVote?: boolean;
	canChangeNote?: boolean;
	voteActionsLeft?: number;
	noteActionsLeft?: number;
	yourReplyId?: string | null;
};

export type VisitorVotePayload = {
	type: 'vote';
	visitorId: string;
	sentiment: VisitorNoteSentiment;
};

export type VisitorVoteChangePayload = {
	type: 'vote-change';
	visitorId: string;
	to: VisitorNoteSentiment;
};

export type VisitorVoteCancelPayload = {
	type: 'vote-cancel';
	visitorId: string;
};

export type VisitorNotePayload = {
	type: 'note';
	visitorId: string;
	sentiment: VisitorNoteSentiment;
	name: string;
	message: string;
};

export type VisitorPostPayload =
	| VisitorVotePayload
	| VisitorVoteChangePayload
	| VisitorVoteCancelPayload
	| VisitorNotePayload;

export const VISITOR_ID_PATTERN = /^[0-9a-f-]{36}$/i;

export const emptyVoteCounts = (): VisitorVoteCounts => ({
	support: 0,
	disagree: 0,
	notCare: 0,
});

export const emptyStore = (): VisitorNotesStore => ({
	votes: emptyVoteCounts(),
	replies: [],
	sessions: {},
});

const SENTIMENTS: VisitorNoteSentiment[] = ['support', 'disagree', 'not-care'];

export const isVisitorSentiment = (
	value: unknown,
): value is VisitorNoteSentiment =>
	typeof value === 'string' && SENTIMENTS.includes(value as VisitorNoteSentiment);

export const isValidVisitorId = (value: unknown): value is string =>
	typeof value === 'string' && VISITOR_ID_PATTERN.test(value);

export const normalizeNoteName = (name: string): string | null => {
	const trimmed = name.trim();
	if (!trimmed || trimmed.length > 48 || /^anonymous$/i.test(trimmed)) {
		return null;
	}
	return trimmed;
};

export const sortVisitorReplies = (replies: VisitorReply[]): VisitorReply[] =>
	[...replies].sort((a, b) => {
		const byTime = b.createdAt.localeCompare(a.createdAt);
		if (byTime !== 0) return byTime;

		return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
	});

const emptySession = (): VisitorSession => ({
	sentiment: null,
	voteActionCount: 0,
	noteActionCount: 0,
	replyId: null,
	displayName: '',
});

export const normalizeSession = (raw: unknown): VisitorSession => {
	if (!raw || typeof raw !== 'object') return emptySession();

	const data = raw as Partial<VisitorSession> & {
		hasApplied?: boolean;
		actionCount?: number;
	};
	const sentiment = isVisitorSentiment(data.sentiment) ? data.sentiment : null;
	const replyId = typeof data.replyId === 'string' ? data.replyId : null;
	const voteActionCount = Math.max(
		0,
		Number(data.voteActionCount) ||
			(data.hasApplied && sentiment && !replyId ? 1 : 0) ||
			(Number(data.actionCount) > 0 && sentiment ? 1 : 0),
	);
	const noteActionCount = Math.max(
		0,
		Number(data.noteActionCount) || (replyId ? 1 : 0),
	);

	return {
		sentiment,
		voteActionCount,
		noteActionCount,
		replyId,
		displayName: typeof data.displayName === 'string' ? data.displayName : '',
	};
};

export const normalizeStore = (raw: unknown): VisitorNotesStore => {
	if (!raw || typeof raw !== 'object') return emptyStore();

	const data = raw as Partial<VisitorNotesStore> & {
		supportCount?: number;
		disagreeCount?: number;
		notCareCount?: number;
	};
	const replies = sortVisitorReplies(
		Array.isArray(data.replies) ? data.replies : [],
	);
	const rawSessions =
		data.sessions && typeof data.sessions === 'object' && !Array.isArray(data.sessions)
			? data.sessions
			: {};
	const sessions = Object.fromEntries(
		Object.entries(rawSessions).map(([id, session]) => [
			id,
			normalizeSession(session),
		]),
	);

	if (data.votes && typeof data.votes === 'object') {
		return {
			votes: {
				support: Math.max(0, Number(data.votes.support) || 0),
				disagree: Math.max(0, Number(data.votes.disagree) || 0),
				notCare: Math.max(0, Number(data.votes.notCare) || 0),
			},
			replies,
			sessions,
		};
	}

	if (
		typeof data.supportCount === 'number' ||
		typeof data.disagreeCount === 'number' ||
		typeof data.notCareCount === 'number'
	) {
		return {
			votes: {
				support: Math.max(0, Number(data.supportCount) || 0),
				disagree: Math.max(0, Number(data.disagreeCount) || 0),
				notCare: Math.max(0, Number(data.notCareCount) || 0),
			},
			replies,
			sessions,
		};
	}

	return {
		votes: {
			support: replies.filter((r) => r.sentiment === 'support').length,
			disagree: replies.filter((r) => r.sentiment === 'disagree').length,
			notCare: replies.filter((r) => r.sentiment === 'not-care').length,
		},
		replies,
		sessions,
	};
};

export const sessionHasApplied = (session: VisitorSession | null) =>
	Boolean(
		session &&
			(session.voteActionCount > 0 ||
				session.noteActionCount > 0 ||
				session.sentiment),
	);

export const withCounts = (
	store: VisitorNotesStore,
	visitorId?: string | null,
): VisitorNotesResponse => {
	const session =
		visitorId && isValidVisitorId(visitorId)
			? store.sessions[visitorId] ?? null
			: null;
	const hasApplied = sessionHasApplied(session);
	const voteActionsLeft = session
		? Math.max(0, MAX_VOTE_ACTIONS - session.voteActionCount)
		: MAX_VOTE_ACTIONS;
	const noteActionsLeft = session
		? Math.max(0, MAX_NOTE_ACTIONS - session.noteActionCount)
		: MAX_NOTE_ACTIONS;

	return {
		...store,
		replies: sortVisitorReplies(store.replies),
		supportCount: store.votes.support,
		disagreeCount: store.votes.disagree,
		notCareCount: store.votes.notCare,
		yourVote: session?.sentiment ?? null,
		hasApplied,
		canEdit: hasApplied,
		canChangeVote: voteActionsLeft > 0,
		canChangeNote: noteActionsLeft > 0,
		voteActionsLeft,
		noteActionsLeft,
		yourReplyId: session?.replyId ?? null,
	};
};

export const voteKeyForSentiment = (sentiment: VisitorNoteSentiment) => {
	if (sentiment === 'support') return 'support' as const;
	if (sentiment === 'disagree') return 'disagree' as const;
	return 'notCare' as const;
};

export const incrementVote = (
	store: VisitorNotesStore,
	sentiment: VisitorNoteSentiment,
) => {
	store.votes[voteKeyForSentiment(sentiment)] += 1;
};

export const decrementVote = (
	store: VisitorNotesStore,
	sentiment: VisitorNoteSentiment,
) => {
	const key = voteKeyForSentiment(sentiment);
	store.votes[key] = Math.max(0, store.votes[key] - 1);
};

export const getOrCreateSession = (
	store: VisitorNotesStore,
	visitorId: string,
	displayName = '',
): VisitorSession => {
	if (!store.sessions[visitorId]) {
		store.sessions[visitorId] = { ...emptySession(), displayName };
	}
	return store.sessions[visitorId];
};

const applySentimentChange = (
	store: VisitorNotesStore,
	session: VisitorSession,
	sentiment: VisitorNoteSentiment,
) => {
	if (session.sentiment === sentiment) return;

	if (session.sentiment) {
		decrementVote(store, session.sentiment);
		incrementVote(store, sentiment);
	} else {
		incrementVote(store, sentiment);
	}

	session.sentiment = sentiment;
};

export type VoteMutationResult =
	| { ok: true; changed: boolean }
	| { ok: false; error: string; locked: boolean };

export const setVisitorVote = (
	store: VisitorNotesStore,
	visitorId: string,
	sentiment: VisitorNoteSentiment,
): VoteMutationResult => {
	const session = getOrCreateSession(store, visitorId);

	if (session.sentiment === sentiment) {
		return { ok: true, changed: false };
	}

	if (session.voteActionCount >= MAX_VOTE_ACTIONS) {
		return {
			ok: false,
			error: 'You used your status changes (2 resets). Your note can still be edited separately.',
			locked: true,
		};
	}

	if (!session.sentiment) {
		incrementVote(store, sentiment);
	} else {
		decrementVote(store, session.sentiment);
		incrementVote(store, sentiment);
	}

	session.sentiment = sentiment;
	session.voteActionCount += 1;
	return { ok: true, changed: true };
};

export const clearVisitorVote = (): Extract<
	VoteMutationResult,
	{ ok: false }
> => ({
	ok: false,
	error: 'Votes cannot be removed. Edit your response instead.',
	locked: false,
});

export const upsertVisitorNote = (
	store: VisitorNotesStore,
	visitorId: string,
	payload: {
		id: string;
		sentiment: VisitorNoteSentiment;
		name: string;
		message: string;
	},
): VoteMutationResult => {
	const name = normalizeNoteName(payload.name);
	if (!name) {
		return {
			ok: false,
			error: 'Enter your name when leaving a note.',
			locked: false,
		};
	}

	const message = payload.message.trim();
	if (!message) {
		return {
			ok: false,
			error: 'Write a note before applying.',
			locked: false,
		};
	}

	const session = getOrCreateSession(store, visitorId, name);
	const isNoteEdit = Boolean(session.replyId);

	if (session.noteActionCount >= MAX_NOTE_ACTIONS) {
		return {
			ok: false,
			error: 'You used your note edit. You can still change your status separately.',
			locked: true,
		};
	}

	if (session.sentiment !== payload.sentiment) {
		applySentimentChange(store, session, payload.sentiment);
	} else if (!session.sentiment) {
		incrementVote(store, payload.sentiment);
		session.sentiment = payload.sentiment;
	}

	session.displayName = name;
	session.noteActionCount += 1;

	if (isNoteEdit) {
		const reply = store.replies.find((item) => item.id === session.replyId);
		if (reply) {
			reply.sentiment = payload.sentiment;
			reply.name = name;
			reply.message = message;
			store.replies = sortVisitorReplies(store.replies);
			return { ok: true, changed: true };
		}
	}

	store.replies.unshift({
		id: payload.id,
		sentiment: payload.sentiment,
		name,
		message,
		createdAt: new Date().toISOString(),
	});
	session.replyId = payload.id;
	store.replies = sortVisitorReplies(store.replies);
	return { ok: true, changed: true };
};
