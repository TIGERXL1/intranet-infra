import { Resolver } from 'dns/promises';
import { env } from '$env/dynamic/private';

const DEGRADED_THRESHOLD_MS = parseInt(env.DEGRADED_DNS_MS ?? '200', 10);
const TIMEOUT_MS = 5000;
// Domain to resolve - must be a zone known to this Bind9 instance
const DNS_PROBE_DOMAIN = env.DNS_PROBE_DOMAIN ?? 'entreprise.local';

export type CheckResult = {
	status: 'online' | 'degraded' | 'offline';
	latencyMs: number | null;
	errorMsg: string | null;
};

export async function checkDns(host: string): Promise<CheckResult> {
	const resolver = new Resolver({ timeout: TIMEOUT_MS });
	resolver.setServers([host]);

	const start = Date.now();
	try {
		// Resolve SOA record - works even if no A record exists for the zone apex
		await resolver.resolveSoa(DNS_PROBE_DOMAIN);
		const latencyMs = Date.now() - start;
		const status = latencyMs > DEGRADED_THRESHOLD_MS ? 'degraded' : 'online';
		return { status, latencyMs, errorMsg: null };
	} catch (err) {
		const latencyMs = Date.now() - start;
		const errorMsg = err instanceof Error ? err.message : String(err);
		// Distinguish timeout vs hard refusal
		const status = 'offline';
		return { status, latencyMs, errorMsg };
	}
}
