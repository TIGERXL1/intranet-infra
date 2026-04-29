import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

const SESSION_COOKIE = 'session';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(SESSION_COOKIE);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const result = await validateSession(sessionId);

	if (!result) {
		event.cookies.delete(SESSION_COOKIE, { path: '/' });
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	event.locals.user = result.user;
	event.locals.session = result.session;

	return resolve(event);
};
