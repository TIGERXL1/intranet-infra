export type ParsedLine = {
	level: 'INFO' | 'WARN' | 'ERROR';
	message: string;
	loggedAt: Date;
};

const JOURNAL_REGEX =
	/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}:?\d{2}|Z)?)\s+\S+\s+(.+)$/;

const LEVEL_KEYWORDS: { pattern: RegExp; level: 'ERROR' | 'WARN' | 'INFO' }[] = [
	{ pattern: /\b(error|fatal|critical|failed|failure|denied|refused|timeout)\b/i, level: 'ERROR' },
	{ pattern: /\b(warning|warn|deprecated|unable)\b/i, level: 'WARN' }
];

function detectLevel(message: string): 'INFO' | 'WARN' | 'ERROR' {
	for (const { pattern, level } of LEVEL_KEYWORDS) {
		if (pattern.test(message)) return level;
	}
	return 'INFO';
}

export function parseJournalLine(line: string): ParsedLine | null {
	const match = JOURNAL_REGEX.exec(line.trim());
	if (!match) return null;

	const [, dateStr, message] = match;
	const loggedAt = new Date(dateStr);
	if (isNaN(loggedAt.getTime())) return null;

	return { level: detectLevel(message), message: message.trim(), loggedAt };
}
