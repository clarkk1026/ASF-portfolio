import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
	handleChatRequest,
	type ChatRequestBody,
} from '../src/lib/ai-bot-chat-handler.js';

const readBody = async (req: VercelRequest): Promise<ChatRequestBody | null> => {
	if (req.body && typeof req.body === 'object') {
		return req.body as ChatRequestBody;
	}

	const chunks: Buffer[] = [];
	for await (const chunk of req) {
		chunks.push(Buffer.from(chunk));
	}
	const raw = Buffer.concat(chunks).toString('utf8');
	return raw ? (JSON.parse(raw) as ChatRequestBody) : null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS') {
		return res.status(204).end();
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const body = await readBody(req);
		if (!body?.message || typeof body.message !== 'string') {
			return res.status(400).json({ error: 'Invalid payload' });
		}

		const clientKey =
			(typeof req.headers['x-forwarded-for'] === 'string'
				? req.headers['x-forwarded-for'].split(',')[0]?.trim()
				: null) ??
			req.socket.remoteAddress ??
			'unknown';

		const reply = await handleChatRequest(
			body,
			{
				geminiApiKey: process.env.GEMINI_API_KEY,
				groqApiKey: process.env.GROQ_API_KEY,
			},
			clientKey,
		);

		return res.status(200).json(reply);
	} catch {
		return res.status(500).json({ error: 'Chat unavailable' });
	}
}
