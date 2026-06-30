import { createClient } from '@vercel/kv';
import { get, put } from '@vercel/blob';
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

const hasBlobStorage = () =>
	Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

const blobClientOptions = () => ({
	token: process.env.BLOB_READ_WRITE_TOKEN,
	storeId: process.env.BLOB_STORE_ID,
});

export const getVisitorNotesStorageMode = (): VisitorNotesStorageMode => {
	if (mode) return mode;

	if (resolveKvConfig()) {
		mode = 'kv';
		return mode;
	}

	if (hasBlobStorage()) {
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

const blobAccess = (): 'private' | 'public' =>
	process.env.BLOB_ACCESS === 'public' ? 'public' : 'private';

const readBlobStore = async (): Promise<VisitorNotesStore> => {
	if (!hasBlobStorage()) return emptyStore();

	try {
		const result = await get(BLOB_PATH, {
			access: blobAccess(),
			...blobClientOptions(),
		});

		if (!result || result.statusCode !== 200 || !result.stream) {
			return emptyStore();
		}

		const text = await new Response(result.stream).text();
		return normalizeStore(JSON.parse(text));
	} catch (error) {
		console.error('[visitor-notes] Blob read failed:', error);
		return emptyStore();
	}
};

const writeBlobStore = async (store: VisitorNotesStore) => {
	if (!hasBlobStorage()) {
		throw new Error('Blob storage unavailable');
	}

	await put(BLOB_PATH, JSON.stringify(normalizeStore(store)), {
		access: blobAccess(),
		addRandomSuffix: false,
		allowOverwrite: true,
		contentType: 'application/json',
		...blobClientOptions(),
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
