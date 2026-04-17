<script lang="ts">
	type Status = 'online' | 'degraded' | 'offline';

	const services: { name: string; category: string; status: Status; latency: number | null; uptime: number; lastCheck: string }[] = [
		{
			name: 'Proxmox VE',
			category: 'Infrastructure',
			status: 'online',
			latency: 12,
			uptime: 99.8,
			lastCheck: 'il y a 30 s'
		},
		{
			name: 'OPNsense',
			category: 'Réseau',
			status: 'online',
			latency: 3,
			uptime: 100,
			lastCheck: 'il y a 30 s'
		},
		{
			name: 'Nextcloud',
			category: 'Productivité',
			status: 'online',
			latency: 45,
			uptime: 98.5,
			lastCheck: 'il y a 30 s'
		},
		{
			name: 'Grafana',
			category: 'Monitoring',
			status: 'degraded',
			latency: 230,
			uptime: 97.2,
			lastCheck: 'il y a 30 s'
		},
		{
			name: 'Portainer',
			category: 'Infrastructure',
			status: 'online',
			latency: 18,
			uptime: 99.9,
			lastCheck: 'il y a 30 s'
		},
		{
			name: 'GitLab',
			category: 'Développement',
			status: 'offline',
			latency: null,
			uptime: 85.0,
			lastCheck: 'il y a 30 s'
		},
		{
			name: 'Prometheus',
			category: 'Monitoring',
			status: 'online',
			latency: 8,
			uptime: 99.5,
			lastCheck: 'il y a 30 s'
		},
		{
			name: 'Vaultwarden',
			category: 'Productivité',
			status: 'online',
			latency: 22,
			uptime: 99.7,
			lastCheck: 'il y a 30 s'
		}
	];

	const statusConfig: Record<Status, { label: string; dot: string; badge: string }> = {
		online: {
			label: 'En ligne',
			dot: 'bg-green-400',
			badge: 'bg-green-400/10 text-green-400'
		},
		degraded: {
			label: 'Dégradé',
			dot: 'bg-yellow-400',
			badge: 'bg-yellow-400/10 text-yellow-400'
		},
		offline: {
			label: 'Hors ligne',
			dot: 'bg-red-400',
			badge: 'bg-red-400/10 text-red-400'
		}
	};

	const onlineCount = services.filter((s) => s.status === 'online').length;
	const degradedCount = services.filter((s) => s.status === 'degraded').length;
	const offlineCount = services.filter((s) => s.status === 'offline').length;
</script>

<div class="p-8">
	<header class="mb-8">
		<h1 class="text-2xl font-bold text-white">État des services</h1>
		<p class="mt-1 text-sm text-slate-400">Supervision en temps réel de l'infrastructure</p>
	</header>

	<!-- Résumé -->
	<div class="mb-8 grid grid-cols-3 gap-4">
		<div class="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-400/10">
				<span class="h-3 w-3 rounded-full bg-green-400"></span>
			</div>
			<div>
				<p class="text-2xl font-bold text-white">{onlineCount}</p>
				<p class="text-sm text-slate-400">En ligne</p>
			</div>
		</div>
		<div class="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/10">
				<span class="h-3 w-3 rounded-full bg-yellow-400"></span>
			</div>
			<div>
				<p class="text-2xl font-bold text-white">{degradedCount}</p>
				<p class="text-sm text-slate-400">Dégradés</p>
			</div>
		</div>
		<div class="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-400/10">
				<span class="h-3 w-3 rounded-full bg-red-400"></span>
			</div>
			<div>
				<p class="text-2xl font-bold text-white">{offlineCount}</p>
				<p class="text-sm text-slate-400">Hors ligne</p>
			</div>
		</div>
	</div>

	<!-- Table -->
	<div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
		<table class="w-full">
			<thead>
				<tr class="border-b border-slate-800">
					<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Service</th>
					<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Statut</th>
					<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Latence</th>
					<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Disponibilité</th>
					<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Dernière vérif.</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-800">
				{#each services as service}
					{@const cfg = statusConfig[service.status]}
					<tr class="hover:bg-slate-800/50 transition-colors">
						<td class="px-6 py-4">
							<div>
								<p class="font-medium text-white">{service.name}</p>
								<p class="text-xs text-slate-500">{service.category}</p>
							</div>
						</td>
						<td class="px-6 py-4">
							<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium {cfg.badge}">
								<span class="h-1.5 w-1.5 rounded-full {cfg.dot}"></span>
								{cfg.label}
							</span>
						</td>
						<td class="px-6 py-4 text-sm text-slate-300">
							{#if service.latency !== null}
								<span class="{service.latency > 100 ? 'text-yellow-400' : 'text-slate-300'}">{service.latency} ms</span>
							{:else}
								<span class="text-slate-600">—</span>
							{/if}
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center gap-2">
								<div class="h-1.5 w-24 overflow-hidden rounded-full bg-slate-700">
									<div
										class="h-full rounded-full {service.uptime >= 99 ? 'bg-green-400' : service.uptime >= 95 ? 'bg-yellow-400' : 'bg-red-400'}"
										style="width: {service.uptime}%"
									></div>
								</div>
								<span class="text-sm text-slate-400">{service.uptime}%</span>
							</div>
						</td>
						<td class="px-6 py-4 text-sm text-slate-500">{service.lastCheck}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
