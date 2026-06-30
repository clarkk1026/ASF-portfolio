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
	isVisitorSentiment,
	normalizeStore,
	setVisitorVote,
	withCounts,
	type VisitorNotePayload,
	type VisitorVoteCancelPayload,
	type VisitorVoteChangePayload,
	type VisitorVotePayload,
} from '../src/lib/visitor-notes-types.js';

const MAX_REPLIES = 200;
const MAX_MESSAGE = 600;
const MAX_NAME = 48;
const VISITOR_ID_PATTERN = /^[0-9a-f-]{36}$/i;

const isValidVisitorId = (value: unknown): value is string =>
	typeof value === 'string' && VISITOR_ID_PATTERN.test(value);

const respondWithCounts = (
	store: Awaited<ReturnType<typeof readVisitorNotesStore>>,
	status: number,
	res: VercelResponse,
	visitorId?: string,
) => {
	const session = visitorId ? store.sessions[visitorId] ?? null : null;
	return res.status(status).json({
		...withCounts(store, session),
		livePersistent: isVisitorNotesPersistent(),
		storageMode: getVisitorNotesStorageMode(),
	});
};

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
		isVisitorSentiment(payload.to) &&
		(!payload.from || isVisitorSentiment(payload.from))
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
		!isVisitorSentiment(payload.sentiment)
	) {
		return false;
	}
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
	res.setHeader('Cache-Control', 'no-store');

	if (req.method === 'OPTIONS') {
		return res.status(204).end();
	}

	try {
		const visitorId =
			typeof req.query.visitorId === 'string' && isValidVisitorId(req.query.visitorId)
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
					return res.status(403).json({
						error: result.error,
						voteLocked: true,
						...withCounts(store, store.sessions[req.body.visitorId]),
						livePersistent: isVisitorNotesPersistent(),
						storageMode: getVisitorNotesStorageMode(),
					});
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
					return res.status(403).json({
						error: result.error,
						voteLocked: true,
						...withCounts(store, store.sessions[req.body.visitorId]),
						livePersistent: isVisitorNotesPersistent(),
						storageMode: getVisitorNotesStorageMode(),
					});
				}
				if (result.changed) {
					await writeVisitorNotesStore(store);
				}
				return respondWithCounts(store, 201, res, req.body.visitorId);
			}

			if (isVoteCancelPayload(req.body)) {
				const result = clearVisitorVote(store, req.body.visitorId);
				if (!result.ok) {
					return res.status(403).json({
						error: result.error,
						voteLocked: true,
						...withCounts(store, store.sessions[req.body.visitorId]),
						livePersistent: isVisitorNotesPersistent(),
						storageMode: getVisitorNotesStorageMode(),
					});
				}
				if (result.changed) {
					await writeVisitorNotesStore(store);
				}
				return respondWithCounts(store, 201, res, req.body.visitorId);
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
