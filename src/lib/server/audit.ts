import { randomUUID } from 'crypto';
import { db } from './db';
import { auditLogs } from './db/schema';

export type AuditAction =
	| 'auth.login.success'
	| 'auth.login.failure'
	| 'auth.logout'
	| 'user.create'
	| 'user.activate'
	| 'user.deactivate'
	| 'user.delete'
	| 'user.password_reset'
	| 'user.profile_update'
	| 'user.password_change';

export async function writeAuditLog(params: {
	actorId: string | null;
	action: AuditAction;
	targetId?: string;
	metadata?: Record<string, unknown>;
	ipAddress?: string;
}): Promise<void> {
	await db.insert(auditLogs).values({
		id: randomUUID(),
		actorId: params.actorId,
		action: params.action,
		targetId: params.targetId ?? null,
		metadata: params.metadata ?? null,
		ipAddress: params.ipAddress ?? null
	});
}
