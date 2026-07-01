import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
	getVisitorNotesStorageMode,
	isVisitorNotesPersistent,
	readVisitorNotesStore,
	writeVisitorNotesStore,
} from './lib/visitor-notes-store.js';
import {
	clearVisitorVote,
	isValidVisitorId,
	isVisitorSentiment,
	normalizeNoteName,
	setVisitorVote,
	upsertVisitorNote,
	withCounts,
	type VisitorNotePayload,
	type VisitorVoteCancelPayload,
	type VisitorVoteChangePayload,
	type VisitorVotePayload,
} from '../src/lib/visitor-notes-types.js';

const MAX_REPLIES = 200;
const MAX_MESSAGE = 600;

const respondWithCounts = (
	store: Awaited<ReturnType<typeof readVisitorNotesStore>>,
	status: number,
	res: VercelResponse,
	visitorId?: string,
) =>
	res.status(status).json({
		...withCounts(store, visitorId),
		visitorId: visitorId ?? null,
		livePersistent: isVisitorNotesPersistent(),
		storageMode: getVisitorNotesStorageMode(),
	});

const rejectMutation = (
	res: VercelResponse,
	store: Awaited<ReturnType<typeof readVisitorNotesStore>>,
	visitorId: string,
	error: string,
) =>
	res.status(403).json({
		error,
		...withCounts(store, visitorId),
		visitorId,
		livePersistent: isVisitorNotesPersistent(),
		storageMode: getVisitorNotesStorageMode(),
	});

const isVotePayload = (body: unknown): body is VisitorVotePayload =>
	!!body &&
	typeof body === 'object' &&
	(body as VisitorVotePayload).type === 'vote' &&
	isValidVisitorId((body as VisitorVotePayload).visitorId) &&
	isVisitorSentiment((body as VisitorVotePayload).sentiment);

const isVoteChangePayload = (body: unknown): body is VisitorVoteChangePayload => {
	if (!body || typeof body !== 'object') return false;
	const payload = body as VisitorVoteChangePayload;
	return (
		payload.type === 'vote-change' &&
		isValidVisitorId(payload.visitorId) &&
		isVisitorSentiment(payload.to)
	);
};

const isVoteCancelPayload = (body: unknown): body is VisitorVoteCancelPayload =>
	!!body &&
	typeof body === 'object' &&
	(body as VisitorVoteCancelPayload).type === 'vote-cancel' &&
	isValidVisitorId((body as VisitorVoteCancelPayload).visitorId);

const isNotePayload = (body: unknown): body is VisitorNotePayload => {
	if (!body || typeof body !== 'object') return false;
	const payload = body as VisitorNotePayload;
	if (
		payload.type !== 'note' ||
		!isValidVisitorId(payload.visitorId) ||
		!isVisitorSentiment(payload.sentiment) ||
		!normalizeNoteName(payload.name)
	) {
		return false;
	}
	if (typeof payload.message !== 'string' || !payload.message.trim()) return false;
	if (payload.message.trim().length > MAX_MESSAGE) return false;
	return true;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	res.setHeader('Cache-Control', 'no-store');

	if (req.method === 'OPTIONS') {
		return res.status(204).end();
	}

	try {
		const visitorId =
			typeof req.query.visitorId === 'string' &&
			isValidVisitorId(req.query.visitorId)
				? req.query.visitorId
				: undefined;

		if (req.method === 'GET') {
			const store = await readVisitorNotesStore();
			return respondWithCounts(store, 200, res, visitorId);
		}

		if (req.method === 'POST') {
			const store = await readVisitorNotesStore();

			if (isVotePayload(req.body)) {
				const result = setVisitorVote(
					store,
					req.body.visitorId,
					req.body.sentiment,
				);
				if (!result.ok) {
					return rejectMutation(
						res,
						store,
						req.body.visitorId,
						result.error,
					);
				}
				if (result.changed) {
					await writeVisitorNotesStore(store);
				}
				return respondWithCounts(store, 201, res, req.body.visitorId);
			}

			if (isVoteChangePayload(req.body)) {
				const result = setVisitorVote(
					store,
					req.body.visitorId,
					req.body.to,
				);
				if (!result.ok) {
					return rejectMutation(
						res,
						store,
						req.body.visitorId,
						result.error,
					);
				}
				if (result.changed) {
					await writeVisitorNotesStore(store);
				}
				return respondWithCounts(store, 201, res, req.body.visitorId);
			}

			if (isVoteCancelPayload(req.body)) {
				const result = clearVisitorVote();
				return rejectMutation(
					res,
					store,
					req.body.visitorId,
					result.ok ? 'Votes cannot be removed.' : result.error,
				);
			}

			if (isNotePayload(req.body)) {
				const result = upsertVisitorNote(store, req.body.visitorId, {
					id: randomUUID(),
					sentiment: req.body.sentiment,
					name: req.body.name,
					message: req.body.message,
				});
				if (!result.ok) {
					return rejectMutation(
						res,
						store,
						req.body.visitorId,
						result.error,
					);
				}
				store.replies = store.replies.slice(0, MAX_REPLIES);
				await writeVisitorNotesStore(store);
				return respondWithCounts(store, 201, res, req.body.visitorId);
			}

			return res.status(400).json({ error: 'Invalid payload' });
		}

		return res.status(405).json({ error: 'Method not allowed' });
	} catch (error) {
		console.error('[visitor-notes] API error:', error);
		return res.status(500).json({ error: 'Visitor notes storage unavailable' });
	}
}
