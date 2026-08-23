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
	isValidVisitorId,
	isVisitorSentiment,
	normalizeNoteName,
	normalizeStore,
	setVisitorVote,
	upsertVisitorNote,
	withCounts,
	type VisitorNotePayload,
	type VisitorVoteCancelPayload,
	type VisitorVoteChangePayload,
	type VisitorVotePayload,
} from './src/lib/visitor-notes-types';
import {
	emptyContactStore,
	isVisitorContactChannel,
	normalizeContactName,
	normalizeContactNote,
	normalizeContactStore,
	normalizeContactValue,
	type VisitorContactPayload,
} from './src/lib/visitor-contact-types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, 'dev-data/visitor-notes.json');
const CONTACT_DATA_FILE = path.resolve(
	__dirname,
	'dev-data/visitor-contacts.json',
);
const MAX_REPLIES = 200;
const MAX_MESSAGE = 600;
const MAX_CONTACTS = 500;
const readStore = () => {
	try {
		const raw = fs.readFileSync(DATA_FILE, 'utf8');
		return normalizeStore(JSON.parse(raw));
	} catch {
		return emptyStore();
	}
};

const respondWithCounts = (
	store: ReturnType<typeof readStore>,
	visitorId?: string,
) => ({
	...withCounts(
		store,
		visitorId && isValidVisitorId(visitorId) ? visitorId : null,
	),
	visitorId: visitorId ?? null,
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
		!normalizeNoteName(payload.name) ||
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
				const visitorId =
					url.searchParams.get('visitorId') &&
					isValidVisitorId(url.searchParams.get('visitorId'))
						? url.searchParams.get('visitorId')!
						: undefined;

				if (req.method === 'GET') {
					res.setHeader('Content-Type', 'application/json');
					res.setHeader('Cache-Control', 'no-store');
					res.end(JSON.stringify(respondWithCounts(readStore(), visitorId)));
					return;
				}

				if (req.method === 'POST') {
					const body = await readBody(req);
					const store = readStore();

					if (isVotePayload(body)) {
						const result = setVisitorVote(
							store,
							body.visitorId,
							body.sentiment,
						);
						if (!result.ok) {
							res.statusCode = 403;
							res.setHeader('Content-Type', 'application/json');
							res.end(
								JSON.stringify({
									error: result.error,
									...respondWithCounts(store, body.visitorId),
								}),
							);
							return;
						}
						if (result.changed) writeStore(store);
						res.statusCode = 201;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify(respondWithCounts(store, body.visitorId)));
						return;
					}

					if (isVoteChangePayload(body)) {
						const result = setVisitorVote(
							store,
							body.visitorId,
							body.to,
						);
						if (!result.ok) {
							res.statusCode = 403;
							res.setHeader('Content-Type', 'application/json');
							res.end(
								JSON.stringify({
									error: result.error,
									...respondWithCounts(store, body.visitorId),
								}),
							);
							return;
						}
						if (result.changed) writeStore(store);
						res.statusCode = 201;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify(respondWithCounts(store, body.visitorId)));
						return;
					}

					if (isVoteCancelPayload(body)) {
						const result = clearVisitorVote();
						res.statusCode = 403;
						res.setHeader('Content-Type', 'application/json');
						res.end(
							JSON.stringify({
								error: result.ok ? 'Votes cannot be removed.' : result.error,
								...respondWithCounts(store, body.visitorId),
							}),
						);
						return;
					}

					if (isNotePayload(body)) {
						const result = upsertVisitorNote(store, body.visitorId, {
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
									...respondWithCounts(store, body.visitorId),
								}),
							);
							return;
						}
						store.replies = store.replies.slice(0, MAX_REPLIES);
						writeStore(store);
						res.statusCode = 201;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify(respondWithCounts(store, body.visitorId)));
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

const readContactStore = () => {
	try {
		const raw = fs.readFileSync(CONTACT_DATA_FILE, 'utf8');
		return normalizeContactStore(JSON.parse(raw));
	} catch {
		return emptyContactStore();
	}
};

const writeContactStore = (store: ReturnType<typeof readContactStore>) => {
	fs.mkdirSync(path.dirname(CONTACT_DATA_FILE), { recursive: true });
	fs.writeFileSync(
		CONTACT_DATA_FILE,
		JSON.stringify(normalizeContactStore(store), null, 2),
		'utf8',
	);
};

const isContactPayload = (body: unknown): body is VisitorContactPayload => {
	if (!body || typeof body !== 'object') return false;
	const payload = body as VisitorContactPayload;
	if (!isValidVisitorId(payload.visitorId)) return false;
	if (!normalizeContactName(payload.name || '')) return false;
	if (!isVisitorContactChannel(payload.channel)) return false;
	if (!normalizeContactValue(payload.value || '')) return false;
	if (payload.note != null && typeof payload.note !== 'string') return false;
	if (typeof payload.note === 'string' && payload.note.length > 400) return false;
	return true;
};

const visitorContactsDevApi = () => ({
	name: 'visitor-contacts-dev-api',
	configureServer(server: import('vite').ViteDevServer) {
		server.middlewares.use('/api/visitor-contacts', async (req, res) => {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
			res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
			res.setHeader('Cache-Control', 'no-store');

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
				const body = await readBody(req);
				if (!isContactPayload(body)) {
					res.statusCode = 400;
					res.setHeader('Content-Type', 'application/json');
					res.end(
						JSON.stringify({
							error:
								'Please provide your name, contact type, and contact details.',
						}),
					);
					return;
				}

				const store = readContactStore();
				const existing = store.contacts.find(
					(item) => item.visitorId === body.visitorId,
				);
				const entry = {
					id: existing?.id ?? randomUUID(),
					visitorId: body.visitorId,
					name: normalizeContactName(body.name),
					channel: body.channel,
					value: normalizeContactValue(body.value),
					note: normalizeContactNote(body.note ?? ''),
					createdAt: existing?.createdAt ?? new Date().toISOString(),
				};

				store.contacts = [
					entry,
					...store.contacts.filter((item) => item.visitorId !== body.visitorId),
				].slice(0, MAX_CONTACTS);
				writeContactStore(store);

				res.statusCode = 201;
				res.setHeader('Content-Type', 'application/json');
				res.end(
					JSON.stringify({
						ok: true,
						updated: Boolean(existing),
						message: existing
							? 'Your contact info was updated.'
							: 'Thanks! Your contact info was saved.',
					}),
				);
			} catch {
				res.statusCode = 500;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ error: 'Could not save contact info.' }));
			}
		});
	},
});

const siteUnlockDevApi = (passkey: string, gateSecret: string) => ({
	name: 'site-unlock-dev-api',
	configureServer(server: import('vite').ViteDevServer) {
		server.middlewares.use('/api/unlock', async (req, res) => {
			res.setHeader('Cache-Control', 'no-store');
			res.setHeader('Content-Type', 'application/json');

			const {
				buildGateCookie,
				consumeUnlockAttempt,
				createGateToken,
				GATE_COOKIE,
				parseCookieHeader,
				passkeysMatch,
				verifyGateToken,
			} = await import('./api/lib/site-gate.ts');

			const secret = gateSecret || (passkey ? `asf-gate:${passkey}` : '');
			const cookieHeader = req.headers.cookie;
			const existing = parseCookieHeader(cookieHeader, GATE_COOKIE);

			if (req.method === 'GET') {
				res.statusCode = 200;
				res.end(JSON.stringify({ unlocked: verifyGateToken(existing, secret) }));
				return;
			}

			if (req.method !== 'POST') {
				res.statusCode = 405;
				res.end(JSON.stringify({ error: 'Method not allowed' }));
				return;
			}

			if (!passkey || !secret) {
				res.statusCode = 503;
				res.end(
					JSON.stringify({
						error: 'Site gate is not configured. Set SITE_PASSKEY in .env',
					}),
				);
				return;
			}

			const ip = req.socket.remoteAddress ?? 'local';
			if (!consumeUnlockAttempt(ip)) {
				res.statusCode = 429;
				res.end(
					JSON.stringify({
						error: 'Too many attempts. Try again in a few minutes.',
					}),
				);
				return;
			}

			try {
				const body = (await readBody(req)) as { passkey?: unknown } | null;
				const provided =
					body && typeof body.passkey === 'string' ? body.passkey : '';

				if (!passkeysMatch(provided, passkey)) {
					res.statusCode = 401;
					res.end(JSON.stringify({ error: 'Incorrect passkey' }));
					return;
				}

				const token = createGateToken(secret);
				res.setHeader('Set-Cookie', buildGateCookie(token, false));
				res.statusCode = 200;
				res.end(JSON.stringify({ unlocked: true }));
			} catch {
				res.statusCode = 500;
				res.end(JSON.stringify({ error: 'Unlock unavailable' }));
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
			visitorContactsDevApi(),
			chatDevApi(env.GEMINI_API_KEY, env.GROQ_API_KEY),
			siteUnlockDevApi(env.SITE_PASSKEY ?? 'Be careful', env.SITE_GATE_SECRET ?? ''),
		],
		server: {
			host: true,
			open: true,
		},
	};
});
