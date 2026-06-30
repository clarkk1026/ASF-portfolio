import { createClient } from '@vercel/kv';
import {
	emptyStore,
	normalizeStore,
	type VisitorNotesStore,
} from '../../src/lib/visitor-notes-types.js';

const KV_KEY = 'visitor-notes';
const MEMORY_KEY = '__portfolioVisitorNotesStore';

type StorageMode = 'kv' | 'memory';

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

const getMode = (): StorageMode => {
	if (mode) return mode;

	const config = resolveKvConfig();
	if (config) {
		mode = 'kv';
		kvClient = createClient(config);
		return mode;
	}

	mode = 'memory';
	console.warn(
		'[visitor-notes] KV not configured; using in-memory storage. Connect Vercel KV for persistent live counts.',
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

export const readVisitorNotesStore = async (): Promise<VisitorNotesStore> => {
	if (getMode() === 'kv') {
		const raw = await getKv().get<VisitorNotesStore>(KV_KEY);
		return normalizeStore(raw ?? emptyStore());
	}

	return normalizeStore(getMemoryStore());
};

export const writeVisitorNotesStore = async (store: VisitorNotesStore): Promise<void> => {
	const normalized = normalizeStore(store);

	if (getMode() === 'kv') {
		await getKv().set(KV_KEY, normalized);
		return;
	}

	setMemoryStore(normalized);
};
