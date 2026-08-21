import { createHmac, timingSafeEqual, createHash } from 'node:crypto';

export const GATE_COOKIE = 'asf_gate';
export const GATE_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days
const GATE_VERSION = 'v1';

export const getSitePasskey = () => (process.env.SITE_PASSKEY ?? '').trim();

export const getGateSecret = () => {
	const explicit = (process.env.SITE_GATE_SECRET ?? '').trim();
	if (explicit) return explicit;
	const passkey = getSitePasskey();
	if (!passkey) return '';
	return `asf-gate:${passkey}`;
};

export const passkeysMatch = (provided: string, expected: string) => {
	if (!expected) return false;
	const a = createHash('sha256').update(provided.trim()).digest();
	const b = createHash('sha256').update(expected).digest();
	return timingSafeEqual(a, b);
};

const signPayload = (secret: string, payload: string) =>
	createHmac('sha256', secret).update(payload).digest('hex');

export const createGateToken = (secret: string, maxAgeSec = GATE_MAX_AGE_SEC) => {
	const exp = Date.now() + maxAgeSec * 1000;
	const payload = `${GATE_VERSION}.${exp}`;
	return `${payload}.${signPayload(secret, payload)}`;
};

export const verifyGateToken = (token: string | undefined, secret: string) => {
	if (!token || !secret) return false;
	const parts = token.split('.');
	if (parts.length !== 3) return false;
	const [version, expRaw, sig] = parts;
	if (version !== GATE_VERSION) return false;
	const exp = Number(expRaw);
	if (!Number.isFinite(exp) || Date.now() > exp) return false;
	const payload = `${version}.${expRaw}`;
	const expected = signPayload(secret, payload);
	try {
		const a = Buffer.from(sig, 'utf8');
		const b = Buffer.from(expected, 'utf8');
		if (a.length !== b.length) return false;
		return timingSafeEqual(a, b);
	} catch {
		return false;
	}
};

export const buildGateCookie = (token: string, secure: boolean) => {
	const parts = [
		`${GATE_COOKIE}=${token}`,
		'Path=/',
		`Max-Age=${GATE_MAX_AGE_SEC}`,
		'HttpOnly',
		'SameSite=Strict',
	];
	if (secure) parts.push('Secure');
	return parts.join('; ');
};

export const parseCookieHeader = (header: string | undefined, name: string) => {
	if (!header) return undefined;
	const match = header
		.split(';')
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${name}=`));
	if (!match) return undefined;
	return decodeURIComponent(match.slice(name.length + 1));
};

/** Simple per-IP unlock rate limit (in-memory; best-effort on serverless). */
const unlockAttempts = new Map<string, number[]>();
const UNLOCK_WINDOW_MS = 15 * 60 * 1000;
const UNLOCK_MAX_ATTEMPTS = 8;

export const consumeUnlockAttempt = (ip: string) => {
	const now = Date.now();
	const recent = (unlockAttempts.get(ip) ?? []).filter(
		(t) => now - t < UNLOCK_WINDOW_MS,
	);
	if (recent.length >= UNLOCK_MAX_ATTEMPTS) {
		unlockAttempts.set(ip, recent);
		return false;
	}
	recent.push(now);
	unlockAttempts.set(ip, recent);
	return true;
};
