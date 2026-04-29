import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { invalidateSession } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ cookies, locals }) => {
		if (locals.session) {
			await invalidateSession(locals.session.id);
		}
		cookies.delete('session', { path: '/' });
		redirect(302, '/login');
	}
};
