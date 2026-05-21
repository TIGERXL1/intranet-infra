import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { auditLogs, users, serviceLogs, services } from '$lib/server/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

const PAGE_SIZE = 50;

type AuditRow = {
	id: string;
	action: string;
	targetId: string | null;
	metadata: unknown;
	ipAddress: string | null;
	createdAt: Date;
	actorUsername: string | null;
	actorDisplayName: string | null;
};

type ServiceLogRow = {
	id: string;
	level: string;
	message: string;
	loggedAt: Date;
	collectedAt: Date;
	serviceName: string | null;
};

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user?.role !== 'admin') redirect(302, '/dashboard');

	const tab = url.searchParams.get('tab') === 'services' ? 'services' : 'audit';
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
	const filterAction = url.searchParams.get('action') ?? '';
	const filterService = url.searchParams.get('service') ?? '';
	const filterLevel = url.searchParams.get('level') ?? '';
	const filterFrom = url.searchParams.get('from') ?? '';
	const filterTo = url.searchParams.get('to') ?? '';

	const toDate = filterTo ? new Date(filterTo) : null;
	if (toDate) toDate.setHours(23, 59, 59, 999);

	let auditRows: AuditRow[] = [];
	let serviceLogRows: ServiceLogRow[] = [];

	if (tab === 'audit') {
		const conditions = [];
		if (filterAction) conditions.push(eq(auditLogs.action, filterAction));
		if (filterFrom) conditions.push(gte(auditLogs.createdAt, new Date(filterFrom)));
		if (toDate) conditions.push(lte(auditLogs.createdAt, toDate));

		auditRows = await db
			.select({
				id: auditLogs.id,
				action: auditLogs.action,
				targetId: auditLogs.targetId,
				metadata: auditLogs.metadata,
				ipAddress: auditLogs.ipAddress,
				createdAt: auditLogs.createdAt,
				actorUsername: users.username,
				actorDisplayName: users.displayName
			})
			.from(auditLogs)
			.leftJoin(users, eq(auditLogs.actorId, users.id))
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(auditLogs.createdAt))
			.limit(PAGE_SIZE)
			.offset((page - 1) * PAGE_SIZE);
	} else {
		const conditions = [];
		if (filterService) conditions.push(eq(serviceLogs.serviceId, filterService));
		if (filterLevel) conditions.push(eq(serviceLogs.level, filterLevel));
		if (filterFrom) conditions.push(gte(serviceLogs.loggedAt, new Date(filterFrom)));
		if (toDate) conditions.push(lte(serviceLogs.loggedAt, toDate));

		serviceLogRows = await db
			.select({
				id: serviceLogs.id,
				level: serviceLogs.level,
				message: serviceLogs.message,
				loggedAt: serviceLogs.loggedAt,
				collectedAt: serviceLogs.collectedAt,
				serviceName: services.name
			})
			.from(serviceLogs)
			.leftJoin(services, eq(serviceLogs.serviceId, services.id))
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(serviceLogs.loggedAt))
			.limit(PAGE_SIZE)
			.offset((page - 1) * PAGE_SIZE);
	}

	const serviceList = await db
		.select({ id: services.id, name: services.name })
		.from(services)
		.where(eq(services.isActive, true));

	return {
		tab,
		page,
		pageSize: PAGE_SIZE,
		hasMore: (tab === 'audit' ? auditRows : serviceLogRows).length === PAGE_SIZE,
		auditLogs: auditRows,
		serviceLogs: serviceLogRows,
		serviceList,
		filters: {
			action: filterAction,
			service: filterService,
			level: filterLevel,
			from: filterFrom,
			to: filterTo
		}
	};
};
