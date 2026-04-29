import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { hashPassword, validatePasswordStrength } from '$lib/server/auth';
import { writeAuditLog } from '$lib/server/audit';
import { eq } from 'drizzle-orm';

const DISPLAY_NAME_MAX = 100;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const load: PageServerLoad = async ({ locals }) => {
	const [user] = await db
		.select({
			username: users.username,
			displayName: users.displayName,
			email: users.email,
			role: users.role,
			lastLoginAt: users.lastLoginAt,
			createdAt: users.createdAt
		})
		.from(users)
		.where(eq(users.id, locals.user!.id))
		.limit(1);

	return { profile: user };
};

export const actions: Actions = {
	updateProfile: async ({ request, locals, getClientAddress }) => {
		const data = await request.formData();
		const displayName = (data.get('displayName') as string | null)?.trim() ?? '';
		const email = (data.get('email') as string | null)?.trim() ?? '';

		if (!displayName) {
			return fail(400, { profileError: 'Le nom affiche ne peut pas etre vide.' });
		}
		if (displayName.length > DISPLAY_NAME_MAX) {
			return fail(400, { profileError: `Le nom affiche ne peut pas depasser ${DISPLAY_NAME_MAX} caracteres.` });
		}
		if (email && !EMAIL_REGEX.test(email)) {
			return fail(400, { profileError: 'Adresse e-mail invalide.' });
		}

		await db
			.update(users)
			.set({ displayName: displayName || null, email: email || null })
			.where(eq(users.id, locals.user!.id));

		await writeAuditLog({
			actorId: locals.user!.id,
			action: 'user.profile_update',
			targetId: locals.user!.id,
			ipAddress: getClientAddress()
		});

		return { profileSuccess: true };
	},

	changePassword: async ({ request, locals, getClientAddress }) => {
		const data = await request.formData();
		const currentPassword = (data.get('currentPassword') as string | null) ?? '';
		const newPassword = (data.get('newPassword') as string | null) ?? '';
		const confirmPassword = (data.get('confirmPassword') as string | null) ?? '';

		if (!currentPassword) {
			return fail(400, { passwordError: 'Mot de passe actuel requis.' });
		}

		const validationError = validatePasswordStrength(newPassword);
		if (validationError) {
			return fail(400, { passwordError: validationError });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { passwordError: 'Les mots de passe ne correspondent pas.' });
		}

		// Verify current password directly without going through verifyLogin
		// to avoid incrementing failedAttempts on the user's own account
		const { verify } = await import('@node-rs/argon2');
		const ARGON2_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1, outputLen: 32 };

		const [user] = await db
			.select({ passwordHash: users.passwordHash })
			.from(users)
			.where(eq(users.id, locals.user!.id))
			.limit(1);

		const valid = await verify(user.passwordHash, currentPassword, ARGON2_OPTIONS);
		if (!valid) {
			return fail(401, { passwordError: 'Mot de passe actuel incorrect.' });
		}

		const passwordHash = await hashPassword(newPassword);
		await db.update(users).set({ passwordHash }).where(eq(users.id, locals.user!.id));

		await writeAuditLog({
			actorId: locals.user!.id,
			action: 'user.password_change',
			targetId: locals.user!.id,
			ipAddress: getClientAddress()
		});

		return { passwordSuccess: true };
	}
};
