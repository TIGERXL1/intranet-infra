import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { hashPassword, verifyLogin, validatePasswordStrength } from '$lib/server/auth';
import { eq } from 'drizzle-orm';

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
	updateProfile: async ({ request, locals }) => {
		const data = await request.formData();
		const displayName = (data.get('displayName') as string | null)?.trim() ?? '';
		const email = (data.get('email') as string | null)?.trim() ?? '';

		if (!displayName) {
			return fail(400, { profileError: 'Le nom affiché ne peut pas être vide.' });
		}

		await db
			.update(users)
			.set({ displayName: displayName || null, email: email || null })
			.where(eq(users.id, locals.user!.id));

		return { profileSuccess: true };
	},

	changePassword: async ({ request, locals }) => {
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

		const [user] = await db
			.select({ username: users.username })
			.from(users)
			.where(eq(users.id, locals.user!.id))
			.limit(1);

		const result = await verifyLogin(user.username, currentPassword);
		if (!result) {
			return fail(401, { passwordError: 'Mot de passe actuel incorrect.' });
		}

		const passwordHash = await hashPassword(newPassword);
		await db.update(users).set({ passwordHash }).where(eq(users.id, locals.user!.id));

		return { passwordSuccess: true };
	}
};
