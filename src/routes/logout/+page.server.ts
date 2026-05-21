import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { invalidateSession } from '$lib/server/auth';
import { writeAuditLog } from '$lib/server/audit';

export const actions: Actions = {
	default: async ({ cookies, locals, getClientAddress }) => {
		if (locals.session) {
			await invalidateSession(locals.session.id);
		}
		if (locals.user) {
			await writeAuditLog({
				actorId: locals.user.id,
				action: 'auth.logout',
				ipAddress: getClientAddress()
			});
		}
		cookies.delete('session', { path: '/' });
		redirect(302, '/login');
	}
};
