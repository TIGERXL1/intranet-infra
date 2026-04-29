// Parses standard syslog lines:
// Apr 29 14:33:51 hostname process[pid]: message

export type ParsedLine = {
	level: 'INFO' | 'WARN' | 'ERROR';
	message: string;
	loggedAt: Date;
};

const SYSLOG_REGEX = /^(\w{3}\s+\d+\s+\d{2}:\d{2}:\d{2})\s+\S+\s+\S+:\s+(.+)$/;

const LEVEL_KEYWORDS: { pattern: RegExp; level: 'ERROR' | 'WARN' | 'INFO' }[] = [
	{ pattern: /\b(error|fatal|critical|fail|refused|denied)\b/i, level: 'ERROR' },
	// OpenLDAP error codes: err=N where N != 0
	{ pattern: /\berr=[1-9]\d*/i, level: 'ERROR' },
	{ pattern: /\b(warning|warn|notice|deprecated)\b/i, level: 'WARN' }
];

function detectLevel(message: string): 'INFO' | 'WARN' | 'ERROR' {
	for (const { pattern, level } of LEVEL_KEYWORDS) {
		if (pattern.test(message)) return level;
	}
	return 'INFO';
}

export function parseSyslogLine(line: string, year = new Date().getFullYear()): ParsedLine | null {
	const match = SYSLOG_REGEX.exec(line.trim());
	if (!match) return null;

	const [, dateStr, message] = match;
	const loggedAt = new Date(`${dateStr} ${year}`);
	if (isNaN(loggedAt.getTime())) return null;

	return { level: detectLevel(message), message: message.trim(), loggedAt };
}
