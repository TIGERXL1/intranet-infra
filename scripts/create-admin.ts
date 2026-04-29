import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import * as schema from '../src/lib/server/db/schema';

const ARGON2_OPTIONS = {
	memoryCost: 19456,
	timeCost: 2,
	parallelism: 1,
	outputLen: 32
};

async function main() {
	const username = process.argv[2];
	const password = process.argv[3];

	if (!username || !password) {
		console.error('Usage: npx tsx scripts/create-admin.ts <username> <password>');
		process.exit(1);
	}

	if (password.length < 12) {
		console.error('Password must be at least 12 characters.');
		process.exit(1);
	}

	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const db = drizzle(pool, { schema });

	const [existing] = await db
		.select({ id: schema.users.id })
		.from(schema.users)
		.where(eq(schema.users.username, username))
		.limit(1);

	if (existing) {
		console.error(`User "${username}" already exists.`);
		await pool.end();
		process.exit(1);
	}

	const passwordHash = await hash(password, ARGON2_OPTIONS);
	const id = randomUUID();

	await db.insert(schema.users).values({
		id,
		username,
		passwordHash,
		role: 'admin',
		isActive: true
	});

	console.log(`Admin "${username}" created (id: ${id})`);
	await pool.end();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
