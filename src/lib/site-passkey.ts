/** Client helpers — passkey never ships in the browser bundle. */

export const checkSiteUnlock = async (): Promise<boolean> => {
	try {
		const res = await fetch('/api/unlock', {
			method: 'GET',
			credentials: 'same-origin',
			cache: 'no-store',
		});
		if (!res.ok) return false;
		const data = (await res.json()) as { unlocked?: boolean };
		return Boolean(data.unlocked);
	} catch {
		return false;
	}
};

export const requestSiteUnlock = async (
	passkey: string,
): Promise<{ ok: true } | { ok: false; error: string }> => {
	try {
		const res = await fetch('/api/unlock', {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ passkey }),
		});
		const data = (await res.json().catch(() => ({}))) as {
			unlocked?: boolean;
			error?: string;
		};
		if (!res.ok || !data.unlocked) {
			return {
				ok: false,
				error:
					typeof data.error === 'string' && data.error
						? data.error
						: 'Incorrect passkey',
			};
		}
		return { ok: true };
	} catch {
		return { ok: false, error: 'Could not reach unlock service' };
	}
};
