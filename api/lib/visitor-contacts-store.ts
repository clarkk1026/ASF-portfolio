import { createClient } from '@vercel/kv';
import { get, put } from '@vercel/blob';
import {
	emptyContactStore,
	normalizeContactStore,
	type VisitorContactsStore,
} from '../../src/lib/visitor-contact-types.js';

const KV_KEY = 'visitor-contacts';
const BLOB_PATH = 'visitor-contacts/store.json';
const MEMORY_KEY = '__portfolioVisitorContactsStore';

type StorageMode = 'kv' | 'blob' | 'memory';

let mode: StorageMode | null = null;
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

const getMode = (): StorageMode => {
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
	return mode;
};

const getKv = () => {
	if (!kvClient) {
		const config = resolveKvConfig();
		if (!config) throw new Error('KV client unavailable');
		kvClient = createClient(config);
	}
	return kvClient;
};

const getMemoryStore = (): VisitorContactsStore => {
	const globalStore = globalThis as typeof globalThis &
		Record<string, VisitorContactsStore | undefined>;
	if (!globalStore[MEMORY_KEY]) {
		globalStore[MEMORY_KEY] = emptyContactStore();
	}
	return globalStore[MEMORY_KEY];
};

const blobAccess = (): 'private' | 'public' =>
	process.env.BLOB_ACCESS === 'public' ? 'public' : 'private';

export const readVisitorContactsStore = async (): Promise<VisitorContactsStore> => {
	const storage = getMode();
	if (storage === 'kv') {
		const raw = await getKv().get(KV_KEY);
		return normalizeContactStore(raw);
	}
	if (storage === 'blob') {
		try {
			const result = await get(BLOB_PATH, {
				access: blobAccess(),
				...blobClientOptions(),
			});
			if (!result || result.statusCode !== 200 || !result.stream) {
				return emptyContactStore();
			}
			const text = await new Response(result.stream).text();
			return normalizeContactStore(JSON.parse(text));
		} catch {
			return emptyContactStore();
		}
	}
	return getMemoryStore();
};

export const writeVisitorContactsStore = async (
	store: VisitorContactsStore,
): Promise<void> => {
	const storage = getMode();
	const normalized = normalizeContactStore(store);
	if (storage === 'kv') {
		await getKv().set(KV_KEY, normalized);
		return;
	}
	if (storage === 'blob') {
		await put(BLOB_PATH, JSON.stringify(normalized), {
			access: blobAccess(),
			addRandomSuffix: false,
			allowOverwrite: true,
			contentType: 'application/json',
			...blobClientOptions(),
		});
		return;
	}
	const globalStore = globalThis as typeof globalThis &
		Record<string, VisitorContactsStore | undefined>;
	globalStore[MEMORY_KEY] = normalized;
};
