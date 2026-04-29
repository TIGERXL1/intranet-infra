import { randomUUID } from 'crypto';
import { eq, lt } from 'drizzle-orm';
import { db } from './db';
import { services, serviceChecks } from './db/schema';
import { checkDns } from './checkers/dns';
import { checkLdap } from './checkers/ldap';
import { checkNextcloud } from './checkers/nextcloud';
import { collectServiceLogs } from './ssh-collector';
import { env } from '$env/dynamic/private';

const INTERVAL_MS = parseInt(env.CHECK_INTERVAL_SECONDS ?? '60', 10) * 1000;
const LOG_COLLECT_INTERVAL_MS = parseInt(env.LOG_COLLECT_INTERVAL_SECONDS ?? '300', 10) * 1000;
// Retain checks for 7 days
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

let schedulerHandle: ReturnType<typeof setInterval> | null = null;
let logCollectorHandle: ReturnType<typeof setInterval> | null = null;

async function runChecks(): Promise<void> {
	const activeServices = await db
		.select()
		.from(services)
		.where(eq(services.isActive, true));

	for (const service of activeServices) {
		let result: { status: 'online' | 'degraded' | 'offline'; latencyMs: number | null; errorMsg: string | null };

		try {
			if (service.checkType === 'dns') {
				result = await checkDns(service.host);
			} else if (service.checkType === 'ldap') {
				result = await checkLdap(service.host);
			} else if (service.checkType === 'nextcloud') {
				result = await checkNextcloud(service.host);
			} else {
				continue;
			}
		} catch (err) {
			result = {
				status: 'offline',
				latencyMs: null,
				errorMsg: err instanceof Error ? err.message : String(err)
			};
		}

		await db.insert(serviceChecks).values({
			id: randomUUID(),
			serviceId: service.id,
			status: result.status,
			latencyMs: result.latencyMs,
			errorMsg: result.errorMsg
		});
	}

	// Purge entries older than retention window
	const cutoff = new Date(Date.now() - RETENTION_MS);
	await db.delete(serviceChecks).where(lt(serviceChecks.checkedAt, cutoff));
}

export async function runChecksNow(): Promise<void> {
	await runChecks();
}

export function startScheduler(): void {
	if (schedulerHandle !== null) return;

	// Run immediately on start, then on interval
	void runChecks();
	schedulerHandle = setInterval(() => void runChecks(), INTERVAL_MS);

	// Log collection runs every 5 minutes (configurable)
	void collectServiceLogs();
	logCollectorHandle = setInterval(() => void collectServiceLogs(), LOG_COLLECT_INTERVAL_MS);
}

export function stopScheduler(): void {
	if (schedulerHandle !== null) {
		clearInterval(schedulerHandle);
		schedulerHandle = null;
	}
	if (logCollectorHandle !== null) {
		clearInterval(logCollectorHandle);
		logCollectorHandle = null;
	}
}
