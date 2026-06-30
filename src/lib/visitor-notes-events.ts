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

/** Only surface new public notes from other visitors — never vote alerts. */
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

	return messages;
};
