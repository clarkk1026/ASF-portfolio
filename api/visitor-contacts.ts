import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
	readVisitorContactsStore,
	writeVisitorContactsStore,
} from './lib/visitor-contacts-store.js';
import {
	isVisitorContactChannel,
	normalizeContactName,
	normalizeContactNote,
	normalizeContactValue,
	type VisitorContactPayload,
} from '../src/lib/visitor-contact-types.js';
import { isValidVisitorId } from '../src/lib/visitor-notes-types.js';

const MAX_CONTACTS = 500;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	res.setHeader('Cache-Control', 'no-store');

	if (req.method === 'OPTIONS') {
		return res.status(204).end();
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		if (!isContactPayload(req.body)) {
			return res.status(400).json({
				error: 'Please provide your name, contact type, and contact details.',
			});
		}

		const store = await readVisitorContactsStore();
		const existing = store.contacts.find(
			(item) => item.visitorId === req.body.visitorId,
		);

		const entry = {
			id: existing?.id ?? randomUUID(),
			visitorId: req.body.visitorId,
			name: normalizeContactName(req.body.name),
			channel: req.body.channel,
			value: normalizeContactValue(req.body.value),
			note: normalizeContactNote(req.body.note ?? ''),
			createdAt: existing?.createdAt ?? new Date().toISOString(),
		};

		store.contacts = [
			entry,
			...store.contacts.filter((item) => item.visitorId !== req.body.visitorId),
		].slice(0, MAX_CONTACTS);

		await writeVisitorContactsStore(store);

		return res.status(201).json({
			ok: true,
			updated: Boolean(existing),
			message: existing
				? 'Your contact info was updated.'
				: 'Thanks! Your contact info was saved.',
		});
	} catch {
		return res.status(500).json({ error: 'Could not save contact info.' });
	}
}
