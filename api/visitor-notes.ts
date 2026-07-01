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
	isValidUserKey,
	isVisitorSentiment,
	normalizeUserKey,
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
const MAX_NAME = 48;

const respondWithCounts = (
	store: Awaited<ReturnType<typeof readVisitorNotesStore>>,
	status: number,
	res: VercelResponse,
	userKey?: string,
) => {
	const session =
		userKey && isValidUserKey(userKey) ? store.sessions[userKey] ?? null : null;
	return res.status(status).json({
		...withCounts(store, session ? userKey : null),
		livePersistent: isVisitorNotesPersistent(),
		storageMode: getVisitorNotesStorageMode(),
	});
};

const rejectMutation = (
	res: VercelResponse,
	store: Awaited<ReturnType<typeof readVisitorNotesStore>>,
	userKey: string,
	error: string,
) =>
	res.status(403).json({
		error,
		...withCounts(store, userKey),
		livePersistent: isVisitorNotesPersistent(),
		storageMode: getVisitorNotesStorageMode(),
	});

const isValidName = (value: unknown): value is string =>
	typeof value === 'string' &&
	value.trim().length > 0 &&
	value.trim().length <= MAX_NAME &&
	normalizeUserKey(value) !== null;

const isVotePayload = (body: unknown): body is VisitorVotePayload =>
	!!body &&
	typeof body === 'object' &&
	(body as VisitorVotePayload).type === 'vote' &&
	isValidUserKey((body as VisitorVotePayload).userKey) &&
	isValidName((body as VisitorVotePayload).name) &&
	isVisitorSentiment((body as VisitorVotePayload).sentiment);

const isVoteChangePayload = (body: unknown): body is VisitorVoteChangePayload => {
	if (!body || typeof body !== 'object') return false;
	const payload = body as VisitorVoteChangePayload;
	return (
		payload.type === 'vote-change' &&
		isValidUserKey(payload.userKey) &&
		isValidName(payload.name) &&
		isVisitorSentiment(payload.to)
	);
};

const isVoteCancelPayload = (body: unknown): body is VisitorVoteCancelPayload =>
	!!body &&
	typeof body === 'object' &&
	(body as VisitorVoteCancelPayload).type === 'vote-cancel' &&
	isValidUserKey((body as VisitorVoteCancelPayload).userKey);

const isNotePayload = (body: unknown): body is VisitorNotePayload => {
	if (!body || typeof body !== 'object') return false;
	const payload = body as VisitorNotePayload;
	if (
		payload.type !== 'note' ||
		!isValidUserKey(payload.userKey) ||
		!isValidName(payload.name) ||
		!isVisitorSentiment(payload.sentiment)
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
		const userKey =
			typeof req.query.userKey === 'string' && isValidUserKey(req.query.userKey)
				? req.query.userKey
				: undefined;

		if (req.method === 'GET') {
			const store = await readVisitorNotesStore();
			return respondWithCounts(store, 200, res, userKey);
		}

		if (req.method === 'POST') {
			const store = await readVisitorNotesStore();

			if (isVotePayload(req.body)) {
				if (req.body.userKey !== normalizeUserKey(req.body.name)) {
					return res.status(400).json({ error: 'Invalid user identity.' });
				}
				const result = setVisitorVote(
					store,
					req.body.userKey,
					req.body.sentiment,
					req.body.name,
				);
				if (!result.ok) {
					return rejectMutation(res, store, req.body.userKey, result.error);
				}
				if (result.changed) {
					await writeVisitorNotesStore(store);
				}
				return respondWithCounts(store, 201, res, req.body.userKey);
			}

			if (isVoteChangePayload(req.body)) {
				if (req.body.userKey !== normalizeUserKey(req.body.name)) {
					return res.status(400).json({ error: 'Invalid user identity.' });
				}
				const result = setVisitorVote(
					store,
					req.body.userKey,
					req.body.to,
					req.body.name,
				);
				if (!result.ok) {
					return rejectMutation(res, store, req.body.userKey, result.error);
				}
				if (result.changed) {
					await writeVisitorNotesStore(store);
				}
				return respondWithCounts(store, 201, res, req.body.userKey);
			}

			if (isVoteCancelPayload(req.body)) {
				const result = clearVisitorVote();
				return rejectMutation(
					res,
					store,
					req.body.userKey,
					result.ok ? 'Votes cannot be removed.' : result.error,
				);
			}

			if (isNotePayload(req.body)) {
				if (req.body.userKey !== normalizeUserKey(req.body.name)) {
					return res.status(400).json({ error: 'Invalid user identity.' });
				}
				const result = upsertVisitorNote(store, req.body.userKey, {
					id: randomUUID(),
					sentiment: req.body.sentiment,
					name: req.body.name,
					message: req.body.message,
				});
				if (!result.ok) {
					return rejectMutation(res, store, req.body.userKey, result.error);
				}
				store.replies = store.replies.slice(0, MAX_REPLIES);
				await writeVisitorNotesStore(store);
				return respondWithCounts(store, 201, res, req.body.userKey);
			}

			return res.status(400).json({ error: 'Invalid payload' });
		}

		return res.status(405).json({ error: 'Method not allowed' });
	} catch (error) {
		console.error('[visitor-notes] API error:', error);
		return res.status(500).json({ error: 'Visitor notes storage unavailable' });
	}
}
