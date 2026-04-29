import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { verifyLogin, createSession } from '$lib/server/auth';
import { checkRateLimit, recordFailedAttempt } from '$lib/server/rate-limit';

const SESSION_COOKIE = 'session';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, '/dashboard');
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const data = await request.formData();
		const username = (data.get('username') as string | null)?.trim() ?? '';
		const password = (data.get('password') as string | null) ?? '';
		const ip = getClientAddress();

		if (!checkRateLimit(ip)) {
			return fail(429, { error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
		}

		if (!username || !password) {
			recordFailedAttempt(ip);
			return fail(400, { error: 'Identifiants incorrects.' });
		}

		const result = await verifyLogin(username, password);

		if (!result) {
			recordFailedAttempt(ip);
			return fail(401, { error: 'Identifiants incorrects.' });
		}

		const sessionId = await createSession(
			result.userId,
			ip,
			request.headers.get('user-agent') ?? undefined
		);

		cookies.set(SESSION_COOKIE, sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 8,
			path: '/'
		});

		redirect(302, '/dashboard');
	}
};
