import { pgTable, varchar, text, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: varchar('id', { length: 36 }).primaryKey(),
	username: varchar('username', { length: 50 }).unique().notNull(),
	displayName: varchar('display_name', { length: 100 }),
	email: varchar('email', { length: 255 }),
	passwordHash: text('password_hash').notNull(),
	role: varchar('role', { length: 10 }).notNull().default('user'),
	isActive: boolean('is_active').notNull().default(true),
	failedAttempts: integer('failed_attempts').notNull().default(0),
	lockedUntil: timestamp('locked_until', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
	createdBy: varchar('created_by', { length: 36 })
});

export const sessions = pgTable('sessions', {
	id: varchar('id', { length: 64 }).primaryKey(),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	ipAddress: varchar('ip_address', { length: 45 }),
	userAgent: text('user_agent')
});

// check_type: dns | ldap | nextcloud
export const services = pgTable('services', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	host: varchar('host', { length: 255 }).notNull(),
	checkType: varchar('check_type', { length: 20 }).notNull(),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// status: online | degraded | offline
export const serviceChecks = pgTable('service_checks', {
	id: varchar('id', { length: 36 }).primaryKey(),
	serviceId: varchar('service_id', { length: 36 })
		.notNull()
		.references(() => services.id, { onDelete: 'cascade' }),
	status: varchar('status', { length: 10 }).notNull(),
	latencyMs: integer('latency_ms'),
	errorMsg: text('error_msg'),
	checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow()
});

// level: INFO | WARN | ERROR
// line_hash: sha256(service_id + logged_at + message) for deduplication
export const serviceLogs = pgTable('service_logs', {
	id: varchar('id', { length: 36 }).primaryKey(),
	serviceId: varchar('service_id', { length: 36 })
		.notNull()
		.references(() => services.id, { onDelete: 'cascade' }),
	level: varchar('level', { length: 10 }).notNull(),
	message: text('message').notNull(),
	loggedAt: timestamp('logged_at', { withTimezone: true }).notNull(),
	collectedAt: timestamp('collected_at', { withTimezone: true }).notNull().defaultNow(),
	lineHash: varchar('line_hash', { length: 64 }).unique().notNull()
});

export const auditLogs = pgTable('audit_logs', {
	id: varchar('id', { length: 36 }).primaryKey(),
	actorId: varchar('actor_id', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
	action: varchar('action', { length: 50 }).notNull(),
	targetId: varchar('target_id', { length: 36 }),
	metadata: jsonb('metadata'),
	ipAddress: varchar('ip_address', { length: 45 }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ServiceCheck = typeof serviceChecks.$inferSelect;
export type ServiceLog = typeof serviceLogs.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
