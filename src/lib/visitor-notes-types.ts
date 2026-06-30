import type { VisitorNoteSentiment } from '../data/portfolio.js';

export const MAX_VOTE_ACTIONS = 2;

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
	actionCount: number;
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
	actionCount?: number;
	voteLocked?: boolean;
	actionsRemaining?: number;
};

export type VisitorVotePayload = {
	type: 'vote';
	visitorId: string;
	sentiment: VisitorNoteSentiment;
};

export type VisitorVoteChangePayload = {
	type: 'vote-change';
	visitorId: string;
	from: VisitorNoteSentiment;
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
	name?: string;
	message: string;
};

export type VisitorPostPayload =
	| VisitorVotePayload
	| VisitorVoteChangePayload
	| VisitorVoteCancelPayload
	| VisitorNotePayload;

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

export const normalizeStore = (raw: unknown): VisitorNotesStore => {
	if (!raw || typeof raw !== 'object') return emptyStore();

	const data = raw as Partial<VisitorNotesStore> & {
		supportCount?: number;
		disagreeCount?: number;
		notCareCount?: number;
	};
	const replies = Array.isArray(data.replies) ? data.replies : [];
	const sessions =
		data.sessions && typeof data.sessions === 'object' && !Array.isArray(data.sessions)
			? data.sessions
			: {};

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

export const withCounts = (
	store: VisitorNotesStore,
	session?: VisitorSession | null,
): VisitorNotesResponse => {
	const actionCount = session?.actionCount ?? 0;
	const voteLocked = actionCount >= MAX_VOTE_ACTIONS;

	return {
		...store,
		supportCount: store.votes.support,
		disagreeCount: store.votes.disagree,
		notCareCount: store.votes.notCare,
		yourVote: session?.sentiment ?? null,
		actionCount,
		voteLocked,
		actionsRemaining: Math.max(0, MAX_VOTE_ACTIONS - actionCount),
	};
};

const SENTIMENTS: VisitorNoteSentiment[] = ['support', 'disagree', 'not-care'];

export const isVisitorSentiment = (
	value: unknown,
): value is VisitorNoteSentiment =>
	typeof value === 'string' && SENTIMENTS.includes(value as VisitorNoteSentiment);

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
): VisitorSession => {
	if (!store.sessions[visitorId]) {
		store.sessions[visitorId] = { sentiment: null, actionCount: 0 };
	}
	return store.sessions[visitorId];
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

	if (session.actionCount >= MAX_VOTE_ACTIONS) {
		return {
			ok: false,
			error: 'You have used all vote changes for this browser.',
			locked: true,
		};
	}

	if (session.sentiment) {
		decrementVote(store, session.sentiment);
	}

	incrementVote(store, sentiment);
	session.sentiment = sentiment;
	session.actionCount += 1;

	return { ok: true, changed: true };
};

export const clearVisitorVote = (
	store: VisitorNotesStore,
	visitorId: string,
): VoteMutationResult => {
	const session = getOrCreateSession(store, visitorId);

	if (!session.sentiment) {
		return { ok: true, changed: false };
	}

	if (session.actionCount >= MAX_VOTE_ACTIONS) {
		return {
			ok: false,
			error: 'You have used all vote changes for this browser.',
			locked: true,
		};
	}

	decrementVote(store, session.sentiment);
	session.sentiment = null;
	session.actionCount += 1;

	return { ok: true, changed: true };
};
