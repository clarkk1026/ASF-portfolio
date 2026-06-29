import type { VisitorNoteSentiment } from '../data/portfolio';

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

export type VisitorNotesStore = {
	votes: VisitorVoteCounts;
	replies: VisitorReply[];
};

export type VisitorNotesResponse = VisitorNotesStore & {
	supportCount: number;
	disagreeCount: number;
	notCareCount: number;
};

export type VisitorVotePayload = {
	type: 'vote';
	sentiment: VisitorNoteSentiment;
};

export type VisitorVoteChangePayload = {
	type: 'vote-change';
	from: VisitorNoteSentiment;
	to: VisitorNoteSentiment;
};

export type VisitorVoteCancelPayload = {
	type: 'vote-cancel';
	sentiment: VisitorNoteSentiment;
};

export type VisitorNotePayload = {
	type: 'note';
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
});

export const normalizeStore = (raw: unknown): VisitorNotesStore => {
	if (!raw || typeof raw !== 'object') return emptyStore();

	const data = raw as Partial<VisitorNotesStore>;
	const replies = Array.isArray(data.replies) ? data.replies : [];

	if (data.votes && typeof data.votes === 'object') {
		return {
			votes: {
				support: Number(data.votes.support) || 0,
				disagree: Number(data.votes.disagree) || 0,
				notCare: Number(data.votes.notCare) || 0,
			},
			replies,
		};
	}

	return {
		votes: {
			support: replies.filter((r) => r.sentiment === 'support').length,
			disagree: replies.filter((r) => r.sentiment === 'disagree').length,
			notCare: replies.filter((r) => r.sentiment === 'not-care').length,
		},
		replies,
	};
};

export const withCounts = (store: VisitorNotesStore): VisitorNotesResponse => ({
	...store,
	supportCount: store.votes.support,
	disagreeCount: store.votes.disagree,
	notCareCount: store.votes.notCare,
});

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
