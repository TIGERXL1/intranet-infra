declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				username: string;
				displayName: string | null;
				role: string;
			} | null;
			session: {
				id: string;
				expiresAt: Date;
			} | null;
		}
	}
}

export {};
