import type { VisitorNoteSentiment } from '../data/portfolio';
import { visitorNote } from '../data/portfolio';
import type { VisitorNotesResponse } from './visitor-notes-types';

export type VisitorNotesSnapshot = {
	supportCount: number;
	disagreeCount: number;
	notCareCount: number;
	replyIds: string[];
};

export const snapshotFromData = (
	data: VisitorNotesResponse,
): VisitorNotesSnapshot => ({
	supportCount: data.supportCount,
	disagreeCount: data.disagreeCount,
	notCareCount: data.notCareCount,
	replyIds: data.replies.map((reply) => reply.id),
});

export const totalVoters = (snapshot: VisitorNotesSnapshot) =>
	snapshot.supportCount + snapshot.disagreeCount + snapshot.notCareCount;

const sentimentLabel = (sentiment: VisitorNoteSentiment) => {
	if (sentiment === 'support') return visitorNote.supportLabel;
	if (sentiment === 'disagree') return visitorNote.disagreeLabel;
	return visitorNote.notCareLabel;
};

export const diffVisitorActivity = (
	previous: VisitorNotesSnapshot,
	next: VisitorNotesResponse,
) => {
	const messages: string[] = [];
	const previousIds = new Set(previous.replyIds);
	const newReplies = next.replies.filter((reply) => !previousIds.has(reply.id));

	for (const reply of newReplies) {
		messages.push(
			visitorNote.notifyNewReply.replace('{name}', reply.name),
		);
	}

	const voteDeltas: Array<{
		sentiment: VisitorNoteSentiment;
		delta: number;
	}> = [
		{
			sentiment: 'support',
			delta: next.supportCount - previous.supportCount,
		},
		{
			sentiment: 'disagree',
			delta: next.disagreeCount - previous.disagreeCount,
		},
		{
			sentiment: 'not-care',
			delta: next.notCareCount - previous.notCareCount,
		},
	];

	const voteIncreases = voteDeltas.filter((entry) => entry.delta > 0);
	const voteDecreases = voteDeltas.filter((entry) => entry.delta < 0);

	if (voteIncreases.length > 0 && newReplies.length === 0) {
		for (const entry of voteIncreases) {
			for (let i = 0; i < entry.delta; i += 1) {
				messages.push(
					visitorNote.notifyVisitorVote.replace(
						'{sentiment}',
						sentimentLabel(entry.sentiment),
					),
				);
			}
		}
	} else if (
		voteIncreases.length > 0 &&
		voteDecreases.length > 0 &&
		newReplies.length === 0
	) {
		messages.push(visitorNote.notifyVoteChanged);
	}

	return messages;
};
