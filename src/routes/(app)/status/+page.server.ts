import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { services, serviceChecks } from '$lib/server/db/schema';
import { eq, desc, gte, and } from 'drizzle-orm';
import { runChecksNow } from '$lib/server/scheduler';

const UPTIME_WINDOW_MS = 24 * 60 * 60 * 1000;

export const load: PageServerLoad = async () => {
	const activeServices = await db
		.select()
		.from(services)
		.where(eq(services.isActive, true));

	const since = new Date(Date.now() - UPTIME_WINDOW_MS);

	const result = await Promise.all(
		activeServices.map(async (service) => {
			// Most recent check
			const [latest] = await db
				.select()
				.from(serviceChecks)
				.where(eq(serviceChecks.serviceId, service.id))
				.orderBy(desc(serviceChecks.checkedAt))
				.limit(1);

			// Uptime over last 24h: ratio of online checks
			const last24h = await db
				.select({ status: serviceChecks.status })
				.from(serviceChecks)
				.where(
					and(
						eq(serviceChecks.serviceId, service.id),
						gte(serviceChecks.checkedAt, since)
					)
				);

			const total = last24h.length;
			const onlineCount = last24h.filter((c) => c.status === 'online').length;
			const uptimePct = total > 0 ? Math.round((onlineCount / total) * 1000) / 10 : null;

			// Average latency over last 24h
			const latencies = last24h
				.map((c) => (c as { latencyMs?: number | null }).latencyMs)
				.filter((v): v is number => v !== null && v !== undefined);
			const avgLatency =
				latencies.length > 0
					? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
					: null;

			return {
				id: service.id,
				name: service.name,
				checkType: service.checkType,
				status: (latest?.status ?? 'offline') as 'online' | 'degraded' | 'offline',
				latencyMs: latest?.latencyMs ?? null,
				avgLatencyMs: avgLatency,
				uptimePct,
				errorMsg: latest?.errorMsg ?? null,
				lastCheckedAt: latest?.checkedAt ?? null
			};
		})
	);

	return { services: result };
};

export const actions: Actions = {
	refresh: async () => {
		await runChecksNow();
	}
};
