import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import {
	handleChatRequest,
	type ChatRequestBody,
} from './src/lib/ai-bot-chat-handler';
import {
	clearVisitorVote,
	emptyStore,
	isValidUserKey,
	isVisitorSentiment,
	normalizeStore,
	normalizeUserKey,
	setVisitorVote,
	upsertVisitorNote,
	withCounts,
	type VisitorNotePayload,
	type VisitorVoteCancelPayload,
	type VisitorVoteChangePayload,
	type VisitorVotePayload,
} from './src/lib/visitor-notes-types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, 'dev-data/visitor-notes.json');
const MAX_REPLIES = 200;
const MAX_MESSAGE = 600;
const MAX_NAME = 48;

const readStore = () => {
	try {
		const raw = fs.readFileSync(DATA_FILE, 'utf8');
		return normalizeStore(JSON.parse(raw));
	} catch {
		return emptyStore();
	}
};

const isValidName = (value: unknown): value is string =>
	typeof value === 'string' &&
	value.trim().length > 0 &&
	value.trim().length <= MAX_NAME &&
	normalizeUserKey(value) !== null;

const respondWithCounts = (
	store: ReturnType<typeof readStore>,
	userKey?: string,
) => ({
	...withCounts(store, userKey && isValidUserKey(userKey) ? userKey : null),
	livePersistent: true,
	storageMode: 'memory' as const,
});

const writeStore = (store: ReturnType<typeof normalizeStore>) => {
	fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
	fs.writeFileSync(DATA_FILE, `${JSON.stringify(store, null, 2)}\n`);
};

const readBody = async (req: import('node:http').IncomingMessage) => {
	const chunks: Buffer[] = [];
	for await (const chunk of req) {
		chunks.push(Buffer.from(chunk));
	}
	const raw = Buffer.concat(chunks).toString('utf8');
	return raw ? (JSON.parse(raw) as unknown) : null;
};

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

const visitorNotesDevApi = () => ({
	name: 'visitor-notes-dev-api',
	configureServer(server: import('vite').ViteDevServer) {
		server.middlewares.use('/api/visitor-notes', async (req, res) => {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
			res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

			if (req.method === 'OPTIONS') {
				res.statusCode = 204;
				res.end();
				return;
			}

			try {
				const url = new URL(req.url ?? '/', 'http://localhost');
				const userKey =
					url.searchParams.get('userKey') &&
					isValidUserKey(url.searchParams.get('userKey'))
						? url.searchParams.get('userKey')!
						: undefined;

				if (req.method === 'GET') {
					res.setHeader('Content-Type', 'application/json');
					res.setHeader('Cache-Control', 'no-store');
					res.end(JSON.stringify(respondWithCounts(readStore(), userKey)));
					return;
				}

				if (req.method === 'POST') {
					const body = await readBody(req);
					const store = readStore();

					if (isVotePayload(body)) {
						const result = setVisitorVote(
							store,
							body.userKey,
							body.sentiment,
							body.name,
						);
						if (!result.ok) {
							res.statusCode = 403;
							res.setHeader('Content-Type', 'application/json');
							res.end(
								JSON.stringify({
									error: result.error,
									...respondWithCounts(store, body.userKey),
								}),
							);
							return;
						}
						if (result.changed) writeStore(store);
						res.statusCode = 201;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify(respondWithCounts(store, body.userKey)));
						return;
					}

					if (isVoteChangePayload(body)) {
						const result = setVisitorVote(
							store,
							body.userKey,
							body.to,
							body.name,
						);
						if (!result.ok) {
							res.statusCode = 403;
							res.setHeader('Content-Type', 'application/json');
							res.end(
								JSON.stringify({
									error: result.error,
									...respondWithCounts(store, body.userKey),
								}),
							);
							return;
						}
						if (result.changed) writeStore(store);
						res.statusCode = 201;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify(respondWithCounts(store, body.userKey)));
						return;
					}

					if (isVoteCancelPayload(body)) {
						const result = clearVisitorVote();
						res.statusCode = 403;
						res.setHeader('Content-Type', 'application/json');
						res.end(
							JSON.stringify({
								error: result.ok ? 'Votes cannot be removed.' : result.error,
								...respondWithCounts(store, body.userKey),
							}),
						);
						return;
					}

					if (isNotePayload(body)) {
						const result = upsertVisitorNote(store, body.userKey, {
							id: randomUUID(),
							sentiment: body.sentiment,
							name: body.name,
							message: body.message,
						});
						if (!result.ok) {
							res.statusCode = 403;
							res.setHeader('Content-Type', 'application/json');
							res.end(
								JSON.stringify({
									error: result.error,
									...respondWithCounts(store, body.userKey),
								}),
							);
							return;
						}
						store.replies = store.replies.slice(0, MAX_REPLIES);
						writeStore(store);
						res.statusCode = 201;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify(respondWithCounts(store, body.userKey)));
						return;
					}

					res.statusCode = 400;
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ error: 'Invalid payload' }));
					return;
				}

				res.statusCode = 405;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ error: 'Method not allowed' }));
			} catch {
				res.statusCode = 500;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ error: 'Visitor notes storage unavailable' }));
			}
		});
	},
});

const chatDevApi = (geminiApiKey?: string, groqApiKey?: string) => ({
	name: 'chat-dev-api',
	configureServer(server: import('vite').ViteDevServer) {
		server.middlewares.use('/api/chat', async (req, res) => {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
			res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

			if (req.method === 'OPTIONS') {
				res.statusCode = 204;
				res.end();
				return;
			}

			if (req.method !== 'POST') {
				res.statusCode = 405;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ error: 'Method not allowed' }));
				return;
			}

			try {
				const body = (await readBody(req)) as ChatRequestBody | null;
				if (!body?.message || typeof body.message !== 'string') {
					res.statusCode = 400;
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ error: 'Invalid payload' }));
					return;
				}

				const reply = await handleChatRequest(
					body,
					{ geminiApiKey, groqApiKey },
					req.socket.remoteAddress ?? 'local',
				);

				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(reply));
			} catch {
				res.statusCode = 500;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ error: 'Chat unavailable' }));
			}
		});
	},
});

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [
			react(),
			visitorNotesDevApi(),
			chatDevApi(env.GEMINI_API_KEY, env.GROQ_API_KEY),
		],
		server: {
			host: true,
			open: true,
		},
	};
});
