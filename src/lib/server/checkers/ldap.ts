import { Client } from 'ldapts';
import { env } from '$env/dynamic/private';

const DEGRADED_THRESHOLD_MS = parseInt(env.DEGRADED_LDAP_MS ?? '500', 10);
const LDAP_PORT = parseInt(env.LDAP_PORT ?? '389', 10);
const TIMEOUT_MS = 5000;

export type CheckResult = {
	status: 'online' | 'degraded' | 'offline';
	latencyMs: number | null;
	errorMsg: string | null;
};

export async function checkLdap(host: string): Promise<CheckResult> {
	const url = `ldap://${host}:${LDAP_PORT}`;
	const client = new Client({ url, timeout: TIMEOUT_MS, connectTimeout: TIMEOUT_MS });

	const start = Date.now();
	try {
		await client.bind('', '');
		const latencyMs = Date.now() - start;
		await client.unbind();
		const status = latencyMs > DEGRADED_THRESHOLD_MS ? 'degraded' : 'online';
		return { status, latencyMs, errorMsg: null };
	} catch (err) {
		const latencyMs = Date.now() - start;
		const errorMsg = err instanceof Error ? err.message : String(err);
		return { status: 'offline', latencyMs, errorMsg };
	} finally {
		try {
			await client.unbind();
		} catch {
			// ignore unbind errors during failure path
		}
	}
}
