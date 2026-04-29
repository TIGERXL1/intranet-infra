import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { randomUUID } from 'crypto';
import * as schema from '../src/lib/server/db/schema';

async function main() {
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const db = drizzle(pool, { schema });

	const entries = [
		{ name: 'SRV-DNS', host: process.env.DNS_HOST ?? '100.66.114.36', checkType: 'dns' },
		{ name: 'SRV-OpenLDAP', host: process.env.LDAP_HOST ?? '100.75.213.57', checkType: 'ldap' },
		{ name: 'SRV-Nextcloud', host: process.env.NEXTCLOUD_URL ?? 'https://100.90.144.11', checkType: 'nextcloud' }
	];

	for (const entry of entries) {
		await db.insert(schema.services).values({ id: randomUUID(), ...entry }).onConflictDoNothing();
		console.log(`Inserted service: ${entry.name}`);
	}

	await pool.end();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
