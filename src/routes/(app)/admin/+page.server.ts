import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { createUser, hashPassword, validatePasswordStrength } from '$lib/server/auth';
import { writeAuditLog } from '$lib/server/audit';
import { eq, count } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'admin') redirect(302, '/dashboard');

	const userList = await db
		.select({
			id: users.id,
			username: users.username,
			displayName: users.displayName,
			role: users.role,
			isActive: users.isActive,
			createdAt: users.createdAt,
			lastLoginAt: users.lastLoginAt
		})
		.from(users)
		.orderBy(users.createdAt);

	return { users: userList };
};

export const actions: Actions = {
	create: async ({ request, locals, getClientAddress }) => {
		if (locals.user?.role !== 'admin') return fail(403, { createError: 'Accès refusé.' });

		const data = await request.formData();
		const username = (data.get('username') as string | null)?.trim() ?? '';
		const password = (data.get('password') as string | null) ?? '';
		const confirmPassword = (data.get('confirmPassword') as string | null) ?? '';
		const role = (data.get('role') as string | null) ?? 'user';

		if (!username || username.length < 3) {
			return fail(400, { createError: "L'identifiant doit contenir au moins 3 caractères." });
		}
		if (!/^[a-z0-9_-]+$/.test(username)) {
			return fail(400, { createError: "L'identifiant ne peut contenir que des lettres minuscules, chiffres, - et _." });
		}

		const validationError = validatePasswordStrength(password);
		if (validationError) return fail(400, { createError: validationError });

		if (password !== confirmPassword) {
			return fail(400, { createError: 'Les mots de passe ne correspondent pas.' });
		}
		if (role !== 'admin' && role !== 'user') {
			return fail(400, { createError: 'Rôle invalide.' });
		}

		const [existing] = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.username, username))
			.limit(1);

		if (existing) {
			return fail(409, { createError: 'Cet identifiant est déjà utilisé.' });
		}

		const newUserId = await createUser({
			username,
			password,
			role: role as 'admin' | 'user',
			createdBy: locals.user.id
		});

		await writeAuditLog({
			actorId: locals.user.id,
			action: 'user.create',
			targetId: newUserId,
			metadata: { username, role },
			ipAddress: getClientAddress()
		});

		return { createSuccess: true };
	},

	toggleActive: async ({ request, locals, getClientAddress }) => {
		if (locals.user?.role !== 'admin') return fail(403, {});

		const data = await request.formData();
		const userId = data.get('userId') as string;

		if (userId === locals.user.id) {
			return fail(400, { toggleError: 'Vous ne pouvez pas désactiver votre propre compte.' });
		}

		const [user] = await db
			.select({ isActive: users.isActive, role: users.role, username: users.username })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) return fail(404, {});

		if (user.role === 'admin' && user.isActive) {
			const [{ value }] = await db
				.select({ value: count() })
				.from(users)
				.where(eq(users.role, 'admin'));

			if (value <= 1) {
				return fail(400, { toggleError: 'Impossible de désactiver le dernier compte administrateur.' });
			}
		}

		const newState = !user.isActive;
		await db.update(users).set({ isActive: newState }).where(eq(users.id, userId));

		await writeAuditLog({
			actorId: locals.user.id,
			action: newState ? 'user.activate' : 'user.deactivate',
			targetId: userId,
			metadata: { username: user.username },
			ipAddress: getClientAddress()
		});

		return {};
	},

	resetPassword: async ({ request, locals, getClientAddress }) => {
		if (locals.user?.role !== 'admin') return fail(403, {});

		const data = await request.formData();
		const userId = data.get('userId') as string;
		const newPassword = (data.get('newPassword') as string | null) ?? '';
		const confirmPassword = (data.get('confirmPassword') as string | null) ?? '';

		const validationError = validatePasswordStrength(newPassword);
		if (validationError) return fail(400, { resetError: validationError, resetUserId: userId });

		if (newPassword !== confirmPassword) {
			return fail(400, { resetError: 'Les mots de passe ne correspondent pas.', resetUserId: userId });
		}

		const [user] = await db
			.select({ username: users.username })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) return fail(404, {});

		const passwordHash = await hashPassword(newPassword);
		await db
			.update(users)
			.set({ passwordHash, failedAttempts: 0, lockedUntil: null })
			.where(eq(users.id, userId));

		await writeAuditLog({
			actorId: locals.user.id,
			action: 'user.password_reset',
			targetId: userId,
			metadata: { username: user.username },
			ipAddress: getClientAddress()
		});

		return { resetSuccess: true, resetUserId: userId };
	},

	deleteUser: async ({ request, locals, getClientAddress }) => {
		if (locals.user?.role !== 'admin') return fail(403, {});

		const data = await request.formData();
		const userId = data.get('userId') as string;

		if (userId === locals.user.id) {
			return fail(400, { deleteError: 'Vous ne pouvez pas supprimer votre propre compte.' });
		}

		const [user] = await db
			.select({ role: users.role, username: users.username })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) return fail(404, {});

		if (user.role === 'admin') {
			const [{ value }] = await db
				.select({ value: count() })
				.from(users)
				.where(eq(users.role, 'admin'));

			if (value <= 1) {
				return fail(400, { deleteError: 'Impossible de supprimer le dernier administrateur.' });
			}
		}

		await writeAuditLog({
			actorId: locals.user.id,
			action: 'user.delete',
			targetId: userId,
			metadata: { username: user.username, role: user.role },
			ipAddress: getClientAddress()
		});

		await db.delete(users).where(eq(users.id, userId));

		return {};
	}
};
