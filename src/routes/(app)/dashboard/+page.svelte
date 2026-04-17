<script lang="ts">
	const services = [
		{ id: 'proxmox', name: 'Proxmox VE', description: 'Virtualisation', url: '#', online: true },
		{ id: 'opnsense', name: 'OPNsense', description: 'Pare-feu', url: '#', online: true },
		{ id: 'nextcloud', name: 'Nextcloud', description: 'Fichiers', url: '#', online: true },
		{ id: 'grafana', name: 'Grafana', description: 'Monitoring', url: '#', online: false },
		{ id: 'portainer', name: 'Portainer', description: 'Conteneurs', url: '#', online: true },
		{ id: 'gitlab', name: 'GitLab', description: 'Code & CI/CD', url: '#', online: false }
	];

	const recentLogs = [
		{ level: 'INFO', service: 'Proxmox', message: 'Sauvegarde VM-101 terminée', time: 'il y a 5 min' },
		{
			level: 'WARN',
			service: 'Grafana',
			message: 'Temps de réponse élevé (230ms)',
			time: 'il y a 12 min'
		},
		{
			level: 'ERROR',
			service: 'GitLab',
			message: 'Service inaccessible',
			time: 'il y a 23 min'
		},
		{
			level: 'INFO',
			service: 'Nextcloud',
			message: 'Synchronisation complète',
			time: 'il y a 1 h'
		}
	];

	const onlineCount = services.filter((s) => s.online).length;
	const offlineCount = services.filter((s) => !s.online).length;

	const levelColor: Record<string, string> = {
		INFO: 'text-blue-400 bg-blue-400/10',
		WARN: 'text-yellow-400 bg-yellow-400/10',
		ERROR: 'text-red-400 bg-red-400/10'
	};
</script>

<div class="p-8">
	<header class="mb-8">
		<h1 class="text-2xl font-bold text-white">Tableau de bord</h1>
		<p class="mt-1 text-sm text-slate-400">Vue d'ensemble de l'infrastructure</p>
	</header>

	<!-- Stats -->
	<div class="mb-8 grid grid-cols-3 gap-4">
		<div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
			<p class="text-sm text-slate-400">Services actifs</p>
			<p class="mt-1 text-3xl font-bold text-green-400">{onlineCount}</p>
		</div>
		<div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
			<p class="text-sm text-slate-400">Services hors ligne</p>
			<p class="mt-1 text-3xl font-bold text-red-400">{offlineCount}</p>
		</div>
		<div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
			<p class="text-sm text-slate-400">Total services</p>
			<p class="mt-1 text-3xl font-bold text-white">{services.length}</p>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-6">
		<!-- Accès rapide -->
		<div>
			<h2 class="mb-4 text-sm font-semibold tracking-wide text-slate-400 uppercase">
				Accès rapide
			</h2>
			<div class="grid grid-cols-2 gap-3">
				{#each services as service}
					<a
						href={service.url}
						class="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-slate-700 hover:bg-slate-800"
					>
						<div
							class="h-2 w-2 flex-shrink-0 rounded-full {service.online
								? 'bg-green-400'
								: 'bg-red-400'}"
						></div>
						<div class="min-w-0">
							<p class="truncate text-sm font-medium text-white">{service.name}</p>
							<p class="truncate text-xs text-slate-500">{service.description}</p>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<!-- Logs récents -->
		<div>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-sm font-semibold tracking-wide text-slate-400 uppercase">
					Activité récente
				</h2>
				<a href="/logs" class="text-xs text-blue-400 hover:text-blue-300">Voir tout →</a>
			</div>
			<div class="space-y-2">
				{#each recentLogs as log}
					<div
						class="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
					>
						<span
							class="mt-0.5 rounded px-1.5 py-0.5 text-xs font-medium {levelColor[log.level]}"
						>
							{log.level}
						</span>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm text-slate-200">{log.message}</p>
							<p class="text-xs text-slate-500">{log.service} · {log.time}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
