import { pgTable, varchar, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

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

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
