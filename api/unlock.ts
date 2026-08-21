import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
	buildGateCookie,
	consumeUnlockAttempt,
	createGateToken,
	GATE_COOKIE,
	getGateSecret,
	getSitePasskey,
	parseCookieHeader,
	passkeysMatch,
	verifyGateToken,
} from './lib/site-gate.js';

const clientIp = (req: VercelRequest) => {
	const forwarded = req.headers['x-forwarded-for'];
	if (typeof forwarded === 'string' && forwarded.trim()) {
		return forwarded.split(',')[0]!.trim();
	}
	if (Array.isArray(forwarded) && forwarded[0]) {
		return forwarded[0].split(',')[0]!.trim();
	}
	return req.socket.remoteAddress ?? 'unknown';
};

const isSecureRequest = (req: VercelRequest) => {
	const proto = req.headers['x-forwarded-proto'];
	if (typeof proto === 'string') return proto.split(',')[0]!.trim() === 'https';
	return process.env.VERCEL === '1';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
	res.setHeader('Cache-Control', 'no-store');

	const secret = getGateSecret();
	const cookieHeader =
		typeof req.headers.cookie === 'string' ? req.headers.cookie : undefined;
	const existing = parseCookieHeader(cookieHeader, GATE_COOKIE);

	if (req.method === 'GET') {
		return res.status(200).json({
			unlocked: verifyGateToken(existing, secret),
		});
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const passkey = getSitePasskey();
	if (!passkey || !secret) {
		return res.status(503).json({
			error: 'Site gate is not configured. Set SITE_PASSKEY on the server.',
		});
	}

	const ip = clientIp(req);
	if (!consumeUnlockAttempt(ip)) {
		return res.status(429).json({
			error: 'Too many attempts. Try again in a few minutes.',
		});
	}

	const body = req.body as { passkey?: unknown } | null;
	const provided =
		body && typeof body.passkey === 'string' ? body.passkey : '';

	if (!passkeysMatch(provided, passkey)) {
		return res.status(401).json({ error: 'Incorrect passkey' });
	}

	const token = createGateToken(secret);
	res.setHeader('Set-Cookie', buildGateCookie(token, isSecureRequest(req)));
	return res.status(200).json({ unlocked: true });
}
