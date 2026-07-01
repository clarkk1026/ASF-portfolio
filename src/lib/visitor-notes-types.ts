import type { VisitorNoteSentiment } from '../data/portfolio.js';

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
	hasApplied: boolean;
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
	yourReplyId?: string | null;
	userKey?: string | null;
};

export type VisitorVotePayload = {
	type: 'vote';
	userKey: string;
	sentiment: VisitorNoteSentiment;
	name: string;
};

export type VisitorVoteChangePayload = {
	type: 'vote-change';
	userKey: string;
	from: VisitorNoteSentiment;
	to: VisitorNoteSentiment;
	name: string;
};

export type VisitorVoteCancelPayload = {
	type: 'vote-cancel';
	userKey: string;
};

export type VisitorNotePayload = {
	type: 'note';
	userKey: string;
	sentiment: VisitorNoteSentiment;
	name: string;
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

const SENTIMENTS: VisitorNoteSentiment[] = ['support', 'disagree', 'not-care'];

export const isVisitorSentiment = (
	value: unknown,
): value is VisitorNoteSentiment =>
	typeof value === 'string' && SENTIMENTS.includes(value as VisitorNoteSentiment);

export const normalizeUserKey = (name: string): string | null => {
	const trimmed = name.trim();
	if (!trimmed || trimmed.length > 48 || /^anonymous$/i.test(trimmed)) {
		return null;
	}
	return trimmed.toLowerCase().replace(/\s+/g, ' ');
};

export const isValidUserKey = (value: unknown): value is string => {
	if (typeof value !== 'string') return false;
	const key = value.trim();
	return key.length > 0 && key.length <= 48 && normalizeUserKey(key) === key;
};

export const sortVisitorReplies = (replies: VisitorReply[]): VisitorReply[] =>
	[...replies].sort((a, b) => {
		const byTime = b.createdAt.localeCompare(a.createdAt);
		if (byTime !== 0) return byTime;

		return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
	});

export const normalizeSession = (raw: unknown): VisitorSession => {
	if (!raw || typeof raw !== 'object') {
		return { sentiment: null, hasApplied: false, replyId: null, displayName: '' };
	}

	const data = raw as Partial<VisitorSession> & { actionCount?: number };
	const sentiment = isVisitorSentiment(data.sentiment) ? data.sentiment : null;

	return {
		sentiment,
		hasApplied: Boolean(
			data.hasApplied ?? sentiment ?? (Number(data.actionCount) > 0),
		),
		replyId: typeof data.replyId === 'string' ? data.replyId : null,
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

export const withCounts = (
	store: VisitorNotesStore,
	userKey?: string | null,
): VisitorNotesResponse => {
	const session =
		userKey && isValidUserKey(userKey) ? store.sessions[userKey] ?? null : null;
	const hasApplied = session?.hasApplied ?? false;

	return {
		...store,
		replies: sortVisitorReplies(store.replies),
		supportCount: store.votes.support,
		disagreeCount: store.votes.disagree,
		notCareCount: store.votes.notCare,
		yourVote: session?.sentiment ?? null,
		hasApplied,
		canEdit: hasApplied,
		yourReplyId: session?.replyId ?? null,
		userKey: session ? userKey ?? null : null,
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
	userKey: string,
	displayName: string,
): VisitorSession => {
	if (!store.sessions[userKey]) {
		store.sessions[userKey] = {
			sentiment: null,
			hasApplied: false,
			replyId: null,
			displayName,
		};
	}
	return store.sessions[userKey];
};

export type VoteMutationResult =
	| { ok: true; changed: boolean; userKey: string }
	| { ok: false; error: string; locked: boolean };

export const setVisitorVote = (
	store: VisitorNotesStore,
	userKey: string,
	sentiment: VisitorNoteSentiment,
	displayName: string,
): VoteMutationResult => {
	const session = getOrCreateSession(store, userKey, displayName);

	if (session.sentiment === sentiment) {
		session.displayName = displayName.trim();
		return { ok: true, changed: false, userKey };
	}

	if (!session.hasApplied) {
		incrementVote(store, sentiment);
		session.sentiment = sentiment;
		session.hasApplied = true;
		session.displayName = displayName.trim();
		return { ok: true, changed: true, userKey };
	}

	if (!session.sentiment) {
		return {
			ok: false,
			error: 'You already applied once. Edit your existing response instead.',
			locked: true,
		};
	}

	decrementVote(store, session.sentiment);
	incrementVote(store, sentiment);
	session.sentiment = sentiment;
	session.displayName = displayName.trim();
	return { ok: true, changed: true, userKey };
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
	userKey: string,
	payload: {
		id: string;
		sentiment: VisitorNoteSentiment;
		name: string;
		message: string;
	},
): VoteMutationResult => {
	const session = getOrCreateSession(store, userKey, payload.name);

	if (!session.hasApplied || !session.sentiment) {
		return {
			ok: false,
			error: 'Apply a status before leaving a note.',
			locked: false,
		};
	}

	const name = payload.name.trim();
	const message = payload.message.trim();
	session.displayName = name;

	if (session.replyId) {
		const reply = store.replies.find((item) => item.id === session.replyId);
		if (reply) {
			reply.sentiment = payload.sentiment;
			reply.name = name;
			reply.message = message;
			store.replies = sortVisitorReplies(store.replies);
			return { ok: true, changed: true, userKey };
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
	return { ok: true, changed: true, userKey };
};
