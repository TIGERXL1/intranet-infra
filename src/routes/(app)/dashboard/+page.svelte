<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const quickLinks = [
		{
			name: 'Nextcloud',
			description: 'Cloud privé',
			url: 'https://192.168.10.20',
			external: true
		},
		{
			name: 'OPNsense',
			description: 'Pare-feu LAN',
			url: 'https://192.168.10.1',
			external: true
		},
		{
			name: 'Proxmox VE',
			description: 'Hyperviseur',
			url: 'https://192.168.1.33:8006',
			external: true
		},
		{
			name: 'État des services',
			description: 'Checks DNS, LDAP, cloud',
			url: '/status',
			external: false
		},
		{
			name: 'Journaux',
			description: 'Audit et collecte SSH',
			url: '/logs',
			external: false
		},
		{
			name: 'Administration',
			description: 'Comptes intranet',
			url: '/admin',
			external: false
		}
	];

	const onlineCount = $derived(data.monitoredServices.filter((s) => s.status === 'online').length);
	const degradedCount = $derived(data.monitoredServices.filter((s) => s.status === 'degraded').length);
	const offlineCount = $derived(data.monitoredServices.filter((s) => s.status === 'offline').length);

	const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
		online: { label: 'En ligne', dot: 'bg-green-400', badge: 'bg-green-400/10 text-green-400' },
		degraded: { label: 'Dégradé', dot: 'bg-yellow-400', badge: 'bg-yellow-400/10 text-yellow-400' },
		offline: { label: 'Hors ligne', dot: 'bg-red-400', badge: 'bg-red-400/10 text-red-400' }
	};

	function formatDate(value: Date | string | null): string {
		if (!value) return 'Jamais';
		return new Intl.DateTimeFormat('fr-FR', {
			dateStyle: 'short',
			timeStyle: 'short'
		}).format(new Date(value));
	}

	function formatLatency(value: number | null): string {
		return value === null ? '-' : `${value} ms`;
	}
</script>

<div class="p-8">
	<header class="mb-8">
		<h1 class="text-2xl font-bold text-white">Tableau de bord</h1>
		<p class="mt-1 text-sm text-slate-400">Vue d'ensemble de l'infrastructure projet</p>
	</header>

	<div class="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
		<div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
			<p class="text-sm text-slate-400">Services suivis</p>
			<p class="mt-1 text-3xl font-bold text-white">{data.monitoredServices.length}</p>
		</div>
		<div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
			<p class="text-sm text-slate-400">En ligne</p>
			<p class="mt-1 text-3xl font-bold text-green-400">{onlineCount}</p>
		</div>
		<div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
			<p class="text-sm text-slate-400">Dégradés</p>
			<p class="mt-1 text-3xl font-bold text-yellow-400">{degradedCount}</p>
		</div>
		<div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
			<p class="text-sm text-slate-400">Hors ligne</p>
			<p class="mt-1 text-3xl font-bold text-red-400">{offlineCount}</p>
		</div>
	</div>

	<div class="grid gap-6 xl:grid-cols-[1fr_420px]">
		<section>
			<h2 class="mb-4 text-sm font-semibold tracking-wide text-slate-400 uppercase">
				Accès rapide
			</h2>
			<div class="grid grid-cols-2 gap-3">
				{#each quickLinks as link}
					<a
						href={link.url}
						target={link.external ? '_blank' : undefined}
						rel={link.external ? 'noreferrer' : undefined}
						class="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-slate-700 hover:bg-slate-800"
					>
						<div class="h-2 w-2 flex-shrink-0 rounded-full bg-blue-400"></div>
						<div class="min-w-0">
							<p class="truncate text-sm font-medium text-white">{link.name}</p>
							<p class="truncate text-xs text-slate-500">{link.description}</p>
						</div>
					</a>
				{/each}
			</div>
		</section>

		<section>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-sm font-semibold tracking-wide text-slate-400 uppercase">
					État monitoré
				</h2>
				<a href="/status" class="text-xs text-blue-400 hover:text-blue-300">Voir tout</a>
			</div>
			<div class="space-y-2">
				{#each data.monitoredServices as service}
					{@const cfg = statusConfig[service.status] ?? statusConfig.offline}
					<div class="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
						<div class="flex items-center justify-between gap-3">
							<div class="min-w-0">
								<p class="truncate text-sm font-medium text-white">{service.name}</p>
								<p class="truncate text-xs text-slate-500">{service.host}</p>
							</div>
							<span
								class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium {cfg.badge}"
							>
								<span class="h-1.5 w-1.5 rounded-full {cfg.dot}"></span>
								{cfg.label}
							</span>
						</div>
						<p class="mt-2 text-xs text-slate-500">
							{service.checkType.toUpperCase()} · {formatLatency(service.latencyMs)} · {formatDate(service.checkedAt)}
						</p>
					</div>
				{/each}
			</div>
		</section>
	</div>

	<section class="mt-8">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-sm font-semibold tracking-wide text-slate-400 uppercase">
				Activité récente
			</h2>
			<a href="/logs" class="text-xs text-blue-400 hover:text-blue-300">Voir les journaux</a>
		</div>
		<div class="rounded-xl border border-slate-800 bg-slate-900">
			{#if data.recentAudits.length === 0}
				<p class="px-4 py-5 text-sm text-slate-500">Aucun événement d'audit enregistré.</p>
			{:else}
				<div class="divide-y divide-slate-800">
					{#each data.recentAudits as log}
						<div class="flex items-center justify-between gap-4 px-4 py-3">
							<p class="text-sm text-slate-200">{log.action}</p>
							<p class="text-xs text-slate-500">{formatDate(log.createdAt)}</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</div>
