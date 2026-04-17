<script lang="ts">
	type Level = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

	const allLogs: { id: number; timestamp: string; level: Level; service: string; message: string }[] = [
		{ id: 1, timestamp: '2026-04-17 14:52:03', level: 'INFO', service: 'Proxmox', message: 'Sauvegarde de la VM-101 (web-server) terminée avec succès' },
		{ id: 2, timestamp: '2026-04-17 14:49:11', level: 'WARN', service: 'Grafana', message: 'Temps de réponse anormalement élevé : 230ms (seuil : 100ms)' },
		{ id: 3, timestamp: '2026-04-17 14:45:00', level: 'ERROR', service: 'GitLab', message: 'Échec de connexion au service - timeout après 30s' },
		{ id: 4, timestamp: '2026-04-17 14:40:22', level: 'INFO', service: 'Nextcloud', message: 'Synchronisation des fichiers utilisateurs complète (1.2 GB)' },
		{ id: 5, timestamp: '2026-04-17 14:38:17', level: 'INFO', service: 'OPNsense', message: 'Mise à jour des règles de pare-feu appliquée' },
		{ id: 6, timestamp: '2026-04-17 14:30:05', level: 'DEBUG', service: 'Prometheus', message: 'Collecte des métriques Proxmox : 42 séries récupérées' },
		{ id: 7, timestamp: '2026-04-17 14:22:44', level: 'ERROR', service: 'GitLab', message: 'Service toujours inaccessible - tentative de redémarrage en cours' },
		{ id: 8, timestamp: '2026-04-17 14:15:30', level: 'INFO', service: 'Portainer', message: 'Conteneur "nginx-proxy" redémarré automatiquement (healthcheck)' },
		{ id: 9, timestamp: '2026-04-17 14:10:02', level: 'WARN', service: 'Proxmox', message: 'Espace disque nœud pve-02 : 78% utilisé (seuil d\'alerte : 75%)' },
		{ id: 10, timestamp: '2026-04-17 14:05:18', level: 'INFO', service: 'Vaultwarden', message: 'Sauvegarde quotidienne de la base de données chiffrée' },
		{ id: 11, timestamp: '2026-04-17 14:00:00', level: 'INFO', service: 'Système', message: 'Vérification automatique programmée démarrée' },
		{ id: 12, timestamp: '2026-04-17 13:55:41', level: 'DEBUG', service: 'Nextcloud', message: 'Nettoyage des fichiers temporaires : 340 MB libérés' },
		{ id: 13, timestamp: '2026-04-17 13:50:09', level: 'INFO', service: 'OPNsense', message: 'Certificat TLS renouvelé pour *.infra.local (Let\'s Encrypt)' },
		{ id: 14, timestamp: '2026-04-17 13:42:55', level: 'WARN', service: 'Grafana', message: 'Datasource Prometheus : délai de scraping augmenté' },
		{ id: 15, timestamp: '2026-04-17 13:30:00', level: 'INFO', service: 'Système', message: 'Tous les services vérifiés - 6/8 opérationnels' }
	];

	const levels: (Level | 'Tous')[] = ['Tous', 'INFO', 'WARN', 'ERROR', 'DEBUG'];
	const services = ['Tous', ...new Set(allLogs.map((l) => l.service))];

	let filterLevel = $state<Level | 'Tous'>('Tous');
	let filterService = $state('Tous');
	let search = $state('');

	const filtered = $derived(
		allLogs.filter((log) => {
			if (filterLevel !== 'Tous' && log.level !== filterLevel) return false;
			if (filterService !== 'Tous' && log.service !== filterService) return false;
			if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
			return true;
		})
	);

	const levelStyle: Record<Level, string> = {
		INFO: 'bg-blue-400/10 text-blue-400',
		WARN: 'bg-yellow-400/10 text-yellow-400',
		ERROR: 'bg-red-400/10 text-red-400',
		DEBUG: 'bg-slate-400/10 text-slate-400'
	};

	const levelDot: Record<Level, string> = {
		INFO: 'bg-blue-400',
		WARN: 'bg-yellow-400',
		ERROR: 'bg-red-400',
		DEBUG: 'bg-slate-400'
	};
</script>

<div class="p-8">
	<header class="mb-8">
		<h1 class="text-2xl font-bold text-white">Journaux</h1>
		<p class="mt-1 text-sm text-slate-400">Historique des événements système</p>
	</header>

	<!-- Filtres -->
	<div class="mb-6 flex flex-wrap gap-3">
		<input
			type="text"
			bind:value={search}
			placeholder="Rechercher dans les messages..."
			class="flex-1 min-w-48 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>

		<select
			bind:value={filterLevel}
			class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
		>
			{#each levels as lvl}
				<option value={lvl}>{lvl}</option>
			{/each}
		</select>

		<select
			bind:value={filterService}
			class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
		>
			{#each services as svc}
				<option value={svc}>{svc}</option>
			{/each}
		</select>
	</div>

	<!-- Compteur résultats -->
	<p class="mb-3 text-xs text-slate-500">{filtered.length} entrée{filtered.length > 1 ? 's' : ''}</p>

	<!-- Logs -->
	<div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
		{#if filtered.length === 0}
			<div class="py-16 text-center text-slate-500">
				Aucun journal ne correspond aux filtres sélectionnés.
			</div>
		{:else}
			<table class="w-full">
				<thead>
					<tr class="border-b border-slate-800">
						<th class="w-44 px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Horodatage</th>
						<th class="w-24 px-4 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Niveau</th>
						<th class="w-32 px-4 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Service</th>
						<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Message</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/50">
					{#each filtered as log}
						<tr class="hover:bg-slate-800/30 transition-colors">
							<td class="px-6 py-3.5 font-mono text-xs text-slate-500">{log.timestamp}</td>
							<td class="px-4 py-3.5">
								<span class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium {levelStyle[log.level]}">
									<span class="h-1.5 w-1.5 rounded-full {levelDot[log.level]}"></span>
									{log.level}
								</span>
							</td>
							<td class="px-4 py-3.5 text-sm text-slate-400">{log.service}</td>
							<td class="px-6 py-3.5 text-sm text-slate-200">{log.message}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
