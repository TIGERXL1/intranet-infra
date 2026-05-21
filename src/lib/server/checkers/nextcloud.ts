import { env } from '$env/dynamic/private';
import https from 'https';
import http from 'http';

const DEGRADED_THRESHOLD_MS = parseInt(env.DEGRADED_NEXTCLOUD_MS ?? '2000', 10);
const TIMEOUT_MS = 8000;
const TLS_VERIFY = env.NEXTCLOUD_TLS_VERIFY !== 'false';

export type CheckResult = {
	status: 'online' | 'degraded' | 'offline';
	latencyMs: number | null;
	errorMsg: string | null;
};

function httpGet(url: string): Promise<{ body: string; statusCode: number }> {
	return new Promise((resolve, reject) => {
		const parsed = new URL(url);
		const agent =
			parsed.protocol === 'https:'
				? new https.Agent({ rejectUnauthorized: TLS_VERIFY })
				: undefined;

		const lib = parsed.protocol === 'https:' ? https : http;

		const req = lib.get(url, { agent, timeout: TIMEOUT_MS }, (res) => {
			let body = '';
			res.on('data', (chunk: Buffer) => {
				body += chunk.toString();
			});
			res.on('end', () => resolve({ body, statusCode: res.statusCode ?? 0 }));
		});

		req.on('timeout', () => {
			req.destroy();
			reject(new Error('Request timeout'));
		});
		req.on('error', reject);
	});
}

export async function checkNextcloud(baseUrl: string): Promise<CheckResult> {
	const url = `${baseUrl.replace(/\/$/, '')}/status.php`;
	const start = Date.now();

	try {
		const { body, statusCode } = await httpGet(url);
		const latencyMs = Date.now() - start;

		if (statusCode < 200 || statusCode >= 300) {
			return { status: 'offline', latencyMs, errorMsg: `HTTP ${statusCode}` };
		}

		let json: Record<string, unknown>;
		try {
			json = JSON.parse(body) as Record<string, unknown>;
		} catch {
			return { status: 'offline', latencyMs, errorMsg: 'Réponse non JSON' };
		}

		if (json.maintenance === true) {
			return { status: 'degraded', latencyMs, errorMsg: 'Nextcloud en mode maintenance' };
		}
		if (json.installed !== true) {
			return { status: 'offline', latencyMs, errorMsg: 'Nextcloud non installé' };
		}

		const status = latencyMs > DEGRADED_THRESHOLD_MS ? 'degraded' : 'online';
		return { status, latencyMs, errorMsg: null };
	} catch (err) {
		const latencyMs = Date.now() - start;
		const errorMsg = err instanceof Error ? err.message : String(err);
		return { status: 'offline', latencyMs, errorMsg };
	}
}
