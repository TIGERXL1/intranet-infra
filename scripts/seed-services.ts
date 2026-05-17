import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/lib/server/db/schema';

const entries = [
	{
		id: 'srv-dns',
		name: 'SRV-DNS',
		host: process.env.DNS_HOST ?? '100.66.114.36',
		checkType: 'dns'
	},
	{
		id: 'srv-openldap',
		name: 'SRV-OpenLDAP',
		host: process.env.LDAP_HOST ?? '100.75.213.57',
		checkType: 'ldap'
	},
	{
		id: 'srv-nextcloud',
		name: 'SRV-Nextcloud',
		host: process.env.NEXTCLOUD_URL ?? 'https://100.90.144.11',
		checkType: 'nextcloud'
	}
] as const;

async function main() {
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const db = drizzle(pool, { schema });

	for (const entry of entries) {
		await db
			.insert(schema.services)
			.values(entry)
			.onConflictDoUpdate({
				target: schema.services.id,
				set: {
					name: entry.name,
					host: entry.host,
					checkType: entry.checkType,
					isActive: true
				}
			});
		console.log(`Seeded service: ${entry.name}`);
	}

	await pool.end();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
