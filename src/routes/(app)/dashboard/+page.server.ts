import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { auditLogs, serviceChecks, serviceLogs, services } from '$lib/server/db/schema';
import { desc, eq, and, ne } from 'drizzle-orm';

type RecentActivity = {
	id: string;
	type: 'audit' | 'service';
	label: string;
	detail: string | null;
	level: string | null;
	createdAt: Date;
};

export const load: PageServerLoad = async () => {
	const activeServices = await db
		.select()
		.from(services)
		.where(and(eq(services.isActive, true), ne(services.checkType, 'proxmox')));

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

	const recentAudits: RecentActivity[] = (
		await db
			.select({
				id: auditLogs.id,
				action: auditLogs.action,
				createdAt: auditLogs.createdAt
			})
			.from(auditLogs)
			.orderBy(desc(auditLogs.createdAt))
			.limit(5)
	).map((log) => ({
		id: log.id,
		type: 'audit',
		label: log.action,
		detail: 'Activité intranet',
		level: null,
		createdAt: log.createdAt
	}));

	const recentServiceLogs: RecentActivity[] = (
		await db
			.select({
				id: serviceLogs.id,
				level: serviceLogs.level,
				message: serviceLogs.message,
				loggedAt: serviceLogs.loggedAt,
				serviceName: services.name
			})
			.from(serviceLogs)
			.leftJoin(services, eq(serviceLogs.serviceId, services.id))
			.orderBy(desc(serviceLogs.loggedAt))
			.limit(5)
	).map((log) => ({
		id: log.id,
		type: 'service',
		label: log.serviceName ?? 'Service',
		detail: log.message,
		level: log.level,
		createdAt: log.loggedAt
	}));

	const recentActivity = [...recentAudits, ...recentServiceLogs]
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
		.slice(0, 6);

	return { monitoredServices, recentActivity };
};
