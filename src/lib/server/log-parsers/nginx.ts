// Parses nginx error log lines:
// 2026/04/29 14:33:51 [error] 1234#0: message
// Parses nginx access log lines (combined format):
// 1.2.3.4 - - [29/Apr/2026:14:33:51 +0200] "GET /path HTTP/1.1" 500 1234 "-" "agent"

export type ParsedLine = {
	level: 'INFO' | 'WARN' | 'ERROR';
	message: string;
	loggedAt: Date;
};

const NGINX_ERROR_REGEX = /^(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] \S+ (.+)$/;
const NGINX_ACCESS_REGEX = /^\S+ \S+ \S+ \[([^\]]+)\] "([^"]*)" (\d{3}) /;

const NGINX_LEVEL_MAP: Record<string, 'INFO' | 'WARN' | 'ERROR'> = {
	emerg: 'ERROR',
	alert: 'ERROR',
	crit: 'ERROR',
	error: 'ERROR',
	warn: 'WARN',
	notice: 'INFO',
	info: 'INFO',
	debug: 'INFO'
};

function httpStatusToLevel(status: number): 'INFO' | 'WARN' | 'ERROR' {
	if (status >= 500) return 'ERROR';
	if (status >= 400) return 'WARN';
	return 'INFO';
}

export function parseNginxErrorLine(line: string): ParsedLine | null {
	const match = NGINX_ERROR_REGEX.exec(line.trim());
	if (!match) return null;

	const [, dateStr, nginxLevel, message] = match;
	const loggedAt = new Date(dateStr.replace(/\//g, '-'));
	if (isNaN(loggedAt.getTime())) return null;

	const level = NGINX_LEVEL_MAP[nginxLevel.toLowerCase()] ?? 'INFO';
	return { level, message: message.trim(), loggedAt };
}

export function parseNginxAccessLine(line: string): ParsedLine | null {
	const match = NGINX_ACCESS_REGEX.exec(line.trim());
	if (!match) return null;

	const [, dateStr, request, statusStr] = match;
	const loggedAt = new Date(dateStr.replace(':', ' '));
	if (isNaN(loggedAt.getTime())) return null;

	const status = parseInt(statusStr, 10);
	// Only collect non-2xx/3xx to avoid flooding the log table with routine traffic
	if (status < 400) return null;

	const level = httpStatusToLevel(status);
	return { level, message: `${request} -> HTTP ${status}`, loggedAt };
}
