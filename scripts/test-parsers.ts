import { parseSyslogLine } from '../src/lib/server/log-parsers/syslog';
import { parseNginxErrorLine, parseNginxAccessLine } from '../src/lib/server/log-parsers/nginx';
import { parseJournalLine } from '../src/lib/server/log-parsers/journal';

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string) {
	if (condition) {
		console.log(`  PASS  ${label}`);
		passed++;
	} else {
		console.error(`  FAIL  ${label}${detail ? ` | ${detail}` : ''}`);
		failed++;
	}
}

function section(title: string) {
	console.log(`\n--- ${title} ---`);
}

// -----------------------------------------------------------------------
// SYSLOG PARSER
// -----------------------------------------------------------------------
section('parseSyslogLine - DNS (Bind9)');

{
	const line = 'Apr 29 14:33:51 SRV-DNS named[1234]: zone localhost/IN: loaded serial 2';
	const result = parseSyslogLine(line);
	assert('parse reussit', result !== null);
	assert('niveau INFO', result?.level === 'INFO');
	assert('message extrait', result?.message.includes('zone localhost'));
	assert('date parsee', result?.loggedAt instanceof Date);
}

{
	const line = 'Apr 29 14:35:00 SRV-DNS named[1234]: error (network unreachable) resolving example.com/A';
	const result = parseSyslogLine(line);
	assert('parse reussit', result !== null);
	assert('niveau ERROR detecte', result?.level === 'ERROR');
}

{
	const line = 'Apr 29 14:36:10 SRV-DNS named[1234]: warning: client 192.168.10.1 rate limit';
	const result = parseSyslogLine(line);
	assert('parse reussit', result !== null);
	assert('niveau WARN detecte', result?.level === 'WARN');
}

section('parseSyslogLine - LDAP (OpenLDAP / slapd)');

{
	const line = 'Apr 29 14:40:00 SRV-OpenLDAP slapd[5678]: conn=1000 op=0 BIND dn="" method=128';
	const result = parseSyslogLine(line);
	assert('parse reussit', result !== null);
	assert('niveau INFO', result?.level === 'INFO');
	assert('message extrait', result?.message.includes('BIND'));
}

{
	// connection_read sans connexion = client deconnecte brutalement, niveau INFO en OpenLDAP
	const line = 'Apr 29 14:41:05 SRV-OpenLDAP slapd[5678]: connection_read(16): no connection!';
	const result = parseSyslogLine(line);
	assert('parse reussit', result !== null);
	assert('niveau INFO (deconnexion client, pas une erreur slapd)', result?.level === 'INFO');
}

{
	// Vrai cas d'erreur slapd : echec d'acces
	const line = 'Apr 29 14:42:00 SRV-OpenLDAP slapd[5678]: send_ldap_result: conn=1 op=1 p=3 err=49 text=invalid credentials';
	const result = parseSyslogLine(line);
	assert('parse reussit', result !== null);
	assert('niveau ERROR detecte sur invalid credentials', result?.level === 'ERROR');
}

section('parseSyslogLine - lignes invalides');

{
	const result = parseSyslogLine('');
	assert('ligne vide retourne null', result === null);
}

{
	const result = parseSyslogLine('ligne completement invalide sans format syslog');
	assert('ligne sans format syslog retourne null', result === null);
}

// -----------------------------------------------------------------------
// NGINX ERROR LOG PARSER
// -----------------------------------------------------------------------
section('parseNginxErrorLine - Nextcloud');

{
	const line = '2026/04/29 14:45:00 [error] 1234#0: *1 open() "/var/www/html/favicon.ico" failed';
	const result = parseNginxErrorLine(line);
	assert('parse reussit', result !== null);
	assert('niveau ERROR', result?.level === 'ERROR');
	assert('date parsee', result?.loggedAt instanceof Date);
	assert('message extrait', result?.message.includes('favicon'));
}

{
	const line = '2026/04/29 14:46:00 [warn] 1234#0: conflicting server name "localhost" on 0.0.0.0:80';
	const result = parseNginxErrorLine(line);
	assert('parse reussit', result !== null);
	assert('niveau WARN', result?.level === 'WARN');
}

{
	const line = '2026/04/29 14:47:00 [notice] 1234#0: nginx/1.18.0 started';
	const result = parseNginxErrorLine(line);
	assert('parse reussit', result !== null);
	assert('niveau INFO pour notice', result?.level === 'INFO');
}

{
	const result = parseNginxErrorLine('ligne invalide');
	assert('ligne invalide retourne null', result === null);
}

// -----------------------------------------------------------------------
// NGINX ACCESS LOG PARSER
// -----------------------------------------------------------------------
section('parseNginxAccessLine - filtrage HTTP');

{
	// Erreur 500 : doit etre collectee
	const line = '192.168.10.1 - - [29/Apr/2026:14:50:00 +0200] "GET /index.php HTTP/1.1" 500 1234 "-" "Mozilla/5.0"';
	const result = parseNginxAccessLine(line);
	assert('HTTP 500 collecte', result !== null);
	assert('niveau ERROR pour 500', result?.level === 'ERROR');
	assert('message contient le status', result?.message.includes('500'));
}

{
	// Erreur 404 : doit etre collectee
	const line = '192.168.10.1 - - [29/Apr/2026:14:51:00 +0200] "GET /missing HTTP/1.1" 404 512 "-" "curl/7.68"';
	const result = parseNginxAccessLine(line);
	assert('HTTP 404 collecte', result !== null);
	assert('niveau WARN pour 404', result?.level === 'WARN');
}

{
	// Succes 200 : NE doit PAS etre collecte (trop de bruit)
	const line = '192.168.10.1 - - [29/Apr/2026:14:52:00 +0200] "GET /status.php HTTP/1.1" 200 89 "-" "curl/7.68"';
	const result = parseNginxAccessLine(line);
	assert('HTTP 200 ignore (pas de bruit)', result === null);
}

{
	// Redirection 301 : NE doit PAS etre collectee
	const line = '192.168.10.1 - - [29/Apr/2026:14:53:00 +0200] "GET / HTTP/1.1" 301 0 "-" "curl/7.68"';
	const result = parseNginxAccessLine(line);
	assert('HTTP 301 ignore', result === null);
}

{
	const result = parseNginxAccessLine('ligne invalide');
	assert('ligne invalide retourne null', result === null);
}

// -----------------------------------------------------------------------
// JOURNALD PARSER
// -----------------------------------------------------------------------
section('parseJournalLine - Proxmox');

{
	const line = '2026-05-17T12:10:00+00:00 pve pvedaemon[1234]: successful auth for user root@pam';
	const result = parseJournalLine(line);
	assert('parse reussit', result !== null);
	assert('niveau INFO', result?.level === 'INFO');
	assert('message extrait', result?.message.includes('root@pam'));
	assert('date parsee', result?.loggedAt instanceof Date);
}

{
	const line = '2026-05-17T12:11:00+00:00 pve pveproxy[1234]: authentication failure; rhost=192.168.10.50 user=root@pam';
	const result = parseJournalLine(line);
	assert('parse reussit', result !== null);
	assert('niveau ERROR detecte', result?.level === 'ERROR');
}

{
	const result = parseJournalLine('ligne invalide');
	assert('ligne invalide retourne null', result === null);
}

// -----------------------------------------------------------------------
// RESULTAT FINAL
// -----------------------------------------------------------------------
console.log(`\n==============================`);
console.log(`Resultats : ${passed} passes, ${failed} echecs`);
console.log(`==============================`);

if (failed > 0) process.exit(1);
