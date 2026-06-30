import { createClient, type VercelKV } from '@vercel/kv';

let client: VercelKV | null = null;

export const hasKvEnv = () =>
	Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export const getKv = (): VercelKV => {
	if (!hasKvEnv()) {
		throw new Error(
			'Missing KV_REST_API_URL and KV_REST_API_TOKEN. Connect a Vercel KV store to this project.',
		);
	}

	if (!client) {
		client = createClient({
			url: process.env.KV_REST_API_URL!,
			token: process.env.KV_REST_API_TOKEN!,
		});
	}

	return client;
};
