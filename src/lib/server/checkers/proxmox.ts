import { env } from '$env/dynamic/private';
import https from 'https';

const DEGRADED_THRESHOLD_MS = parseInt(env.DEGRADED_PROXMOX_MS ?? '1000', 10);
const TIMEOUT_MS = 5000;
const TLS_VERIFY = env.PROXMOX_TLS_VERIFY !== 'false';

export type CheckResult = {
	status: 'online' | 'degraded' | 'offline';
	latencyMs: number | null;
	errorMsg: string | null;
};

function resolveUrl(host: string): string {
	if (host.startsWith('http://') || host.startsWith('https://')) return host;
	return `https://${host}:8006`;
}

function httpGet(url: string): Promise<{ statusCode: number }> {
	return new Promise((resolve, reject) => {
		const req = https.get(
			`${resolveUrl(url).replace(/\/$/, '')}/api2/json/version`,
			{ agent: new https.Agent({ rejectUnauthorized: TLS_VERIFY }), timeout: TIMEOUT_MS },
			(res) => {
				res.resume();
				res.on('end', () => resolve({ statusCode: res.statusCode ?? 0 }));
			}
		);

		req.on('timeout', () => {
			req.destroy();
			reject(new Error('Request timeout'));
		});
		req.on('error', reject);
	});
}

export async function checkProxmox(host: string): Promise<CheckResult> {
	const start = Date.now();

	try {
		const { statusCode } = await httpGet(host);
		const latencyMs = Date.now() - start;

		if (statusCode < 200 || statusCode >= 300) {
			return { status: 'offline', latencyMs, errorMsg: `HTTP ${statusCode}` };
		}

		const status = latencyMs > DEGRADED_THRESHOLD_MS ? 'degraded' : 'online';
		return { status, latencyMs, errorMsg: null };
	} catch (err) {
		const latencyMs = Date.now() - start;
		const errorMsg = err instanceof Error ? err.message : String(err);
		return { status: 'offline', latencyMs, errorMsg };
	}
}
