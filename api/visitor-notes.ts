import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
	isVisitorNotesPersistent,
	readVisitorNotesStore,
	writeVisitorNotesStore,
} from './lib/visitor-notes-store.js';
import {
	decrementVote,
	incrementVote,
	isVisitorSentiment,
	withCounts,
	type VisitorNotePayload,
	type VisitorVoteCancelPayload,
	type VisitorVoteChangePayload,
	type VisitorVotePayload,
} from '../src/lib/visitor-notes-types.js';

const respondWithCounts = (store: Awaited<ReturnType<typeof readVisitorNotesStore>>, status: number, res: VercelResponse) =>
	res.status(status).json({
		...withCounts(store),
		livePersistent: isVisitorNotesPersistent(),
	});

const MAX_REPLIES = 200;
const MAX_MESSAGE = 600;
const MAX_NAME = 48;

const isVotePayload = (body: unknown): body is VisitorVotePayload =>
	!!body &&
	typeof body === 'object' &&
	(body as VisitorVotePayload).type === 'vote' &&
	isVisitorSentiment((body as VisitorVotePayload).sentiment);

const isVoteChangePayload = (body: unknown): body is VisitorVoteChangePayload => {
	if (!body || typeof body !== 'object') return false;
	const payload = body as VisitorVoteChangePayload;
	return (
		payload.type === 'vote-change' &&
		isVisitorSentiment(payload.from) &&
		isVisitorSentiment(payload.to) &&
		payload.from !== payload.to
	);
};

const isVoteCancelPayload = (body: unknown): body is VisitorVoteCancelPayload =>
	!!body &&
	typeof body === 'object' &&
	(body as VisitorVoteCancelPayload).type === 'vote-cancel' &&
	isVisitorSentiment((body as VisitorVoteCancelPayload).sentiment);

const isNotePayload = (body: unknown): body is VisitorNotePayload => {
	if (!body || typeof body !== 'object') return false;
	const payload = body as VisitorNotePayload;
	if (payload.type !== 'note' || !isVisitorSentiment(payload.sentiment)) return false;
	if (typeof payload.message !== 'string' || !payload.message.trim()) return false;
	if (payload.message.trim().length > MAX_MESSAGE) return false;
	if (payload.name !== undefined && typeof payload.name !== 'string') return false;
	if (typeof payload.name === 'string' && payload.name.trim().length > MAX_NAME) {
		return false;
	}
	return true;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS') {
		return res.status(204).end();
	}

	try {
		if (req.method === 'GET') {
			const store = await readVisitorNotesStore();
			return respondWithCounts(store, 200, res);
		}

		if (req.method === 'POST') {
			const store = await readVisitorNotesStore();

			if (isVotePayload(req.body)) {
				incrementVote(store, req.body.sentiment);
				await writeVisitorNotesStore(store);
				return respondWithCounts(store, 201, res);
			}

			if (isVoteChangePayload(req.body)) {
				decrementVote(store, req.body.from);
				incrementVote(store, req.body.to);
				await writeVisitorNotesStore(store);
				return respondWithCounts(store, 201, res);
			}

			if (isVoteCancelPayload(req.body)) {
				decrementVote(store, req.body.sentiment);
				await writeVisitorNotesStore(store);
				return respondWithCounts(store, 201, res);
			}

			if (isNotePayload(req.body)) {
				store.replies.unshift({
					id: randomUUID(),
					sentiment: req.body.sentiment,
					name: req.body.name?.trim() || 'Anonymous',
					message: req.body.message.trim(),
					createdAt: new Date().toISOString(),
				});
				store.replies = store.replies.slice(0, MAX_REPLIES);
				await writeVisitorNotesStore(store);
				return respondWithCounts(store, 201, res);
			}

			return res.status(400).json({ error: 'Invalid payload' });
		}

		return res.status(405).json({ error: 'Method not allowed' });
	} catch {
		return res.status(500).json({ error: 'Visitor notes storage unavailable' });
	}
}
