import { createClient } from '@vercel/kv';
import { list, put } from '@vercel/blob';
import {
	emptyStore,
	normalizeStore,
	type VisitorNotesStore,
} from '../../src/lib/visitor-notes-types.js';

const KV_KEY = 'visitor-notes';
const BLOB_PATH = 'visitor-notes/store.json';
const MEMORY_KEY = '__portfolioVisitorNotesStore';

export type VisitorNotesStorageMode = 'kv' | 'blob' | 'memory';

let mode: VisitorNotesStorageMode | null = null;
let kvClient: ReturnType<typeof createClient> | null = null;

const resolveKvConfig = () => {
	if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
		return {
			url: process.env.KV_REST_API_URL,
			token: process.env.KV_REST_API_TOKEN,
		};
	}

	if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
		return {
			url: process.env.UPSTASH_REDIS_REST_URL,
			token: process.env.UPSTASH_REDIS_REST_TOKEN,
		};
	}

	return null;
};

const hasBlobToken = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export const getVisitorNotesStorageMode = (): VisitorNotesStorageMode => {
	if (mode) return mode;

	if (resolveKvConfig()) {
		mode = 'kv';
		return mode;
	}

	if (hasBlobToken()) {
		mode = 'blob';
		return mode;
	}

	mode = 'memory';
	console.warn(
		'[visitor-notes] Using in-memory storage. Connect Vercel KV or Blob for persistent live counts.',
	);
	return mode;
};

const getKv = () => {
	if (!kvClient) {
		const config = resolveKvConfig();
		if (!config) {
			throw new Error('KV client unavailable');
		}
		kvClient = createClient(config);
	}

	return kvClient;
};

const getMemoryStore = (): VisitorNotesStore => {
	const globalStore = globalThis as typeof globalThis &
		Record<string, VisitorNotesStore | undefined>;

	if (!globalStore[MEMORY_KEY]) {
		globalStore[MEMORY_KEY] = emptyStore();
	}

	return globalStore[MEMORY_KEY];
};

const setMemoryStore = (store: VisitorNotesStore) => {
	const globalStore = globalThis as typeof globalThis &
		Record<string, VisitorNotesStore | undefined>;
	globalStore[MEMORY_KEY] = store;
};

const readBlobStore = async (): Promise<VisitorNotesStore> => {
	const token = process.env.BLOB_READ_WRITE_TOKEN;
	if (!token) return emptyStore();

	try {
		const { blobs } = await list({ prefix: 'visitor-notes/', token });
		const blob = blobs.find((entry) => entry.pathname === BLOB_PATH);
		if (!blob?.url) return emptyStore();

		const response = await fetch(blob.url, { cache: 'no-store' });
		if (!response.ok) return emptyStore();

		return normalizeStore(await response.json());
	} catch {
		return emptyStore();
	}
};

const writeBlobStore = async (store: VisitorNotesStore) => {
	const token = process.env.BLOB_READ_WRITE_TOKEN;
	if (!token) {
		throw new Error('Blob token unavailable');
	}

	await put(BLOB_PATH, JSON.stringify(normalizeStore(store)), {
		access: 'public',
		addRandomSuffix: false,
		allowOverwrite: true,
		token,
		contentType: 'application/json',
	});
};

export const isVisitorNotesPersistent = () =>
	getVisitorNotesStorageMode() !== 'memory';

export const readVisitorNotesStore = async (): Promise<VisitorNotesStore> => {
	const storageMode = getVisitorNotesStorageMode();

	if (storageMode === 'kv') {
		const raw = await getKv().get<VisitorNotesStore>(KV_KEY);
		return normalizeStore(raw ?? emptyStore());
	}

	if (storageMode === 'blob') {
		return readBlobStore();
	}

	return normalizeStore(getMemoryStore());
};

export const writeVisitorNotesStore = async (store: VisitorNotesStore): Promise<void> => {
	const normalized = normalizeStore(store);
	const storageMode = getVisitorNotesStorageMode();

	if (storageMode === 'kv') {
		await getKv().set(KV_KEY, normalized);
		return;
	}

	if (storageMode === 'blob') {
		await writeBlobStore(normalized);
		return;
	}

	setMemoryStore(normalized);
};
