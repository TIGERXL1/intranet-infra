import { Client } from 'ssh2';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { env } from '$env/dynamic/private';
import { db } from './db';
import { services, serviceLogs } from './db/schema';
import { eq, lt } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { parseSyslogLine } from './log-parsers/syslog';
import { parseNginxErrorLine, parseNginxAccessLine } from './log-parsers/nginx';
import { parseJournalLine } from './log-parsers/journal';

const SSH_USER = env.SSH_LOG_USER ?? 'intranet-monitor';
const SSH_KEY_PATH = env.SSH_KEY_PATH ?? '/home/trading/.ssh/intranet_monitor_ed25519';
const LOG_LINES = parseInt(env.SSH_LOG_LINES ?? '500', 10);
// Retain service logs for 7 days
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

type ParsedLine = {
	level: 'INFO' | 'WARN' | 'ERROR';
	message: string;
	loggedAt: Date;
};

function computeHash(serviceId: string, loggedAt: Date, message: string): string {
	return createHash('sha256')
		.update(`${serviceId}|${loggedAt.toISOString()}|${message}`)
		.digest('hex')
		.slice(0, 64);
}

function sshExec(host: string, command: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const conn = new Client();
		let output = '';

		conn.on('ready', () => {
			conn.exec(command, (err, stream) => {
				if (err) {
					conn.end();
					return reject(err);
				}
				stream.on('data', (data: Buffer) => {
					output += data.toString();
				});
				stream.stderr.on('data', () => {
					// stderr intentionally ignored - non-fatal warnings from tail
				});
				stream.on('close', () => {
					conn.end();
					resolve(output);
				});
			});
		});

		conn.on('error', reject);

		let privateKey: Buffer;
		try {
			privateKey = readFileSync(SSH_KEY_PATH);
		} catch (err) {
			return reject(new Error(`SSH key not found at ${SSH_KEY_PATH}: ${err}`));
		}

		conn.connect({ host, username: SSH_USER, privateKey });
	});
}

function envNameForService(service: { id: string; checkType: string }): string {
	return `${service.id}_${service.checkType}`.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

function hostFromServiceTarget(target: string): string {
	try {
		return new URL(target).hostname;
	} catch {
		return target;
	}
}

function resolveLogHost(service: { id: string; host: string; checkType: string }): string {
	const serviceEnv = env[`LOG_HOST_${envNameForService(service)}`];
	const typeEnv = env[`${service.checkType.toUpperCase()}_LOG_HOST`];
	return serviceEnv ?? typeEnv ?? hostFromServiceTarget(service.host);
}

async function collectForService(service: { id: string; host: string; checkType: string }): Promise<void> {
	let rawLines: string[] = [];
	const logHost = resolveLogHost(service);

	try {
		if (service.checkType === 'dns') {
			const out = await sshExec(logHost, `tail -n ${LOG_LINES} /var/log/syslog | grep -Ei 'named|bind9'`);
			rawLines = out.split('\n').filter(Boolean);
		} else if (service.checkType === 'ldap') {
			const out = await sshExec(logHost, `tail -n ${LOG_LINES} /var/log/syslog | grep -i slapd`);
			rawLines = out.split('\n').filter(Boolean);
		} else if (service.checkType === 'nextcloud') {
			const [errorOut, accessOut] = await Promise.all([
				sshExec(logHost, `tail -n ${LOG_LINES} /var/log/nginx/error.log`),
				sshExec(logHost, `tail -n ${LOG_LINES} /var/log/nginx/access.log`)
			]);
			rawLines = [
				...errorOut.split('\n').filter(Boolean).map((l) => `ERROR_LOG:${l}`),
				...accessOut.split('\n').filter(Boolean).map((l) => `ACCESS_LOG:${l}`)
			];
		} else if (service.checkType === 'proxmox') {
			const out = await sshExec(
				logHost,
				`sudo -n /usr/bin/journalctl -n ${LOG_LINES} --no-pager -o short-iso -u pvedaemon -u pveproxy -u pvestatd -u pve-cluster -u corosync 2>/dev/null`
			);
			rawLines = out.split('\n').filter(Boolean);
		}
	} catch (err) {
		// SSH connection failed - not fatal, will retry at next collection cycle
		console.error(`[ssh-collector] ${service.checkType} (${logHost}):`, err instanceof Error ? err.message : err);
		return;
	}

	const parsed: (ParsedLine & { hash: string })[] = [];

	for (const raw of rawLines) {
		let line: ParsedLine | null = null;

		if (service.checkType === 'nextcloud') {
			if (raw.startsWith('ERROR_LOG:')) {
				line = parseNginxErrorLine(raw.slice('ERROR_LOG:'.length));
			} else if (raw.startsWith('ACCESS_LOG:')) {
				line = parseNginxAccessLine(raw.slice('ACCESS_LOG:'.length));
			}
		} else {
			line = service.checkType === 'proxmox' ? parseJournalLine(raw) : parseSyslogLine(raw);
		}

		if (!line) continue;

		const hash = computeHash(service.id, line.loggedAt, line.message);
		parsed.push({ ...line, hash });
	}

	if (parsed.length === 0) return;

	// Insert with conflict ignore on line_hash (deduplication)
	for (const entry of parsed) {
		await db
			.insert(serviceLogs)
			.values({
				id: randomUUID(),
				serviceId: service.id,
				level: entry.level,
				message: entry.message,
				loggedAt: entry.loggedAt,
				lineHash: entry.hash
			})
			.onConflictDoNothing();
	}
}

export async function collectServiceLogs(): Promise<void> {
	const activeServices = await db
		.select()
		.from(services)
		.where(eq(services.isActive, true));

	await Promise.allSettled(activeServices.map((s) => collectForService(s)));

	// Purge logs older than retention window
	const cutoff = new Date(Date.now() - RETENTION_MS);
	await db.delete(serviceLogs).where(lt(serviceLogs.collectedAt, cutoff));
}
