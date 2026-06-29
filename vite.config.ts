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
	decrementVote,
	emptyStore,
	incrementVote,
	isVisitorSentiment,
	normalizeStore,
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
				if (req.method === 'GET') {
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify(withCounts(readStore())));
					return;
				}

				if (req.method === 'POST') {
					const body = await readBody(req);
					const store = readStore();

					if (isVotePayload(body)) {
						incrementVote(store, body.sentiment);
						writeStore(store);
						res.statusCode = 201;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify(withCounts(store)));
						return;
					}

					if (isVoteChangePayload(body)) {
						decrementVote(store, body.from);
						incrementVote(store, body.to);
						writeStore(store);
						res.statusCode = 201;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify(withCounts(store)));
						return;
					}

					if (isVoteCancelPayload(body)) {
						decrementVote(store, body.sentiment);
						writeStore(store);
						res.statusCode = 201;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify(withCounts(store)));
						return;
					}

					if (isNotePayload(body)) {
						store.replies.unshift({
							id: randomUUID(),
							sentiment: body.sentiment,
							name: body.name?.trim() || 'Anonymous',
							message: body.message.trim(),
							createdAt: new Date().toISOString(),
						});
						store.replies = store.replies.slice(0, MAX_REPLIES);
						writeStore(store);
						res.statusCode = 201;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify(withCounts(store)));
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

const chatDevApi = (groqApiKey?: string) => ({
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
					groqApiKey,
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
		plugins: [react(), visitorNotesDevApi(), chatDevApi(env.GROQ_API_KEY)],
		server: {
			host: true,
			open: true,
		},
	};
});
