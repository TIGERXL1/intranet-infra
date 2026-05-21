interface Entry {
	count: number;
	resetAt: number;
}

const store = new Map<string, Entry>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function checkRateLimit(key: string): boolean {
	const now = Date.now();
	const entry = store.get(key);
	if (!entry || entry.resetAt < now) return true;
	return entry.count < MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string): void {
	const now = Date.now();
	const entry = store.get(key);
	if (!entry || entry.resetAt < now) {
		store.set(key, { count: 1, resetAt: now + WINDOW_MS });
	} else {
		store.set(key, { count: entry.count + 1, resetAt: entry.resetAt });
	}
}
