import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { auditLogs, serviceChecks, services } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const activeServices = await db.select().from(services).where(eq(services.isActive, true));

	const monitoredServices = await Promise.all(
		activeServices.map(async (service) => {
			const [latest] = await db
				.select()
				.from(serviceChecks)
				.where(eq(serviceChecks.serviceId, service.id))
				.orderBy(desc(serviceChecks.checkedAt))
				.limit(1);

			return {
				id: service.id,
				name: service.name,
				host: service.host,
				checkType: service.checkType,
				status: latest?.status ?? 'offline',
				latencyMs: latest?.latencyMs ?? null,
				checkedAt: latest?.checkedAt ?? null
			};
		})
	);

	const recentAudits = await db
		.select({
			id: auditLogs.id,
			action: auditLogs.action,
			createdAt: auditLogs.createdAt
		})
		.from(auditLogs)
		.orderBy(desc(auditLogs.createdAt))
		.limit(5);

	return { monitoredServices, recentAudits };
};
