import { hash, verify } from '@node-rs/argon2';
import { randomBytes, randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users, sessions } from './db/schema';

const ARGON2_OPTIONS = {
	memoryCost: 19456,
	timeCost: 2,
	parallelism: 1,
	outputLen: 32
};

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const LOCKOUT_THRESHOLD = 10;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export function validatePasswordStrength(password: string): string | null {
	if (password.length < 12) return 'Au moins 12 caractères requis.';
	if (password.length > 128) return 'Mot de passe trop long.';
	if (!/[A-Z]/.test(password)) return 'Au moins une majuscule requise.';
	if (!/[a-z]/.test(password)) return 'Au moins une minuscule requise.';
	if (!/[0-9]/.test(password)) return 'Au moins un chiffre requis.';
	if (!/[^A-Za-z0-9]/.test(password)) return 'Au moins un caractère spécial requis.';
	return null;
}

export async function hashPassword(password: string): Promise<string> {
	return hash(password, ARGON2_OPTIONS);
}

export async function verifyLogin(
	username: string,
	password: string
): Promise<{ userId: string } | null> {
	const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

	// Always run hash comparison to prevent timing attacks
	if (!user || !user.isActive) {
		await hash('dummy', ARGON2_OPTIONS);
		return null;
	}

	if (user.lockedUntil && user.lockedUntil > new Date()) {
		return null;
	}

	const valid = await verify(user.passwordHash, password);

	if (!valid) {
		const newCount = user.failedAttempts + 1;
		const lockUntil = newCount >= LOCKOUT_THRESHOLD ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;
		await db
			.update(users)
			.set({ failedAttempts: newCount, ...(lockUntil ? { lockedUntil: lockUntil } : {}) })
			.where(eq(users.id, user.id));
		return null;
	}

	await db
		.update(users)
		.set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
		.where(eq(users.id, user.id));

	return { userId: user.id };
}

export async function createSession(
	userId: string,
	ipAddress?: string,
	userAgent?: string
): Promise<string> {
	const id = randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

	await db.insert(sessions).values({ id, userId, expiresAt, ipAddress, userAgent });
	return id;
}

export async function validateSession(sessionId: string): Promise<{
	user: { id: string; username: string; displayName: string | null; role: string };
	session: { id: string; expiresAt: Date };
} | null> {
	const [row] = await db
		.select({
			session: sessions,
			user: {
				id: users.id,
				username: users.username,
				displayName: users.displayName,
				role: users.role,
				isActive: users.isActive
			}
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId))
		.limit(1);

	if (!row || !row.user.isActive || row.session.expiresAt < new Date()) {
		if (row) await db.delete(sessions).where(eq(sessions.id, sessionId));
		return null;
	}

	return {
		user: {
			id: row.user.id,
			username: row.user.username,
			displayName: row.user.displayName,
			role: row.user.role
		},
		session: { id: row.session.id, expiresAt: row.session.expiresAt }
	};
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function createUser(data: {
	username: string;
	password: string;
	role: 'admin' | 'user';
	createdBy?: string;
}): Promise<string> {
	const id = randomUUID();
	const passwordHash = await hashPassword(data.password);
	await db.insert(users).values({
		id,
		username: data.username,
		passwordHash,
		role: data.role,
		createdBy: data.createdBy ?? null
	});
	return id;
}
