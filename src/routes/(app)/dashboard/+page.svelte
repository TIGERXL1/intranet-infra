<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const quickLinks = [
		{
			name: 'Nextcloud',
			description: 'Cloud privé',
			url: 'https://192.168.10.20',
			external: true,
			icon: 'M3 15a4 4 0 014-4h1.26A5.5 5.5 0 0119 12.5 3.5 3.5 0 1119 19H7a4 4 0 01-4-4z'
		},
		{
			name: 'OPNsense',
			description: 'Pare-feu LAN',
			url: 'https://192.168.10.1',
			external: true,
			icon: 'M12 3l8 4v5c0 5-3.4 8.7-8 9-4.6-.3-8-4-8-9V7l8-4z'
		},
		{
			name: 'Proxmox VE',
			description: 'Hyperviseur',
			url: 'https://192.168.1.33:8006',
			external: true,
			icon: 'M4 5h16v14H4V5zm4 4h3v3H8V9zm5 0h3v3h-3V9zm-5 5h3v2H8v-2zm5 0h3v2h-3v-2z'
		},
		{
			name: 'État des services',
			description: 'Checks DNS, LDAP, cloud',
			url: '/status',
			external: false,
			icon: 'M4 19V9m5 10V5m5 14v-7m5 7V3'
		},
		{
			name: 'Journaux',
			description: 'Audit et collecte SSH',
			url: '/logs',
			external: false,
			icon: 'M8 7h8M8 11h8M8 15h5M6 3h12a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V5a2 2 0 012-2z'
		},
		{
			name: 'Administration',
			description: 'Comptes intranet',
			url: '/admin',
			external: false,
			icon: 'M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 11a4 4 0 100-8 4 4 0 000 8zm11 10v-2a4 4 0 00-3-3.87M17 3.13a4 4 0 010 7.75'
		}
	];

	const onlineCount = $derived(data.monitoredServices.filter((s) => s.status === 'online').length);
	const degradedCount = $derived(
		data.monitoredServices.filter((s) => s.status === 'degraded').length
	);
	const offlineCount = $derived(
		data.monitoredServices.filter((s) => s.status === 'offline').length
	);

	const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
		online: {
			label: 'En ligne',
			dot: 'bg-emerald-400',
			badge: 'bg-emerald-400/10 text-emerald-300'
		},
		degraded: { label: 'Dégradé', dot: 'bg-amber-400', badge: 'bg-amber-400/10 text-amber-300' },
		offline: { label: 'Hors ligne', dot: 'bg-rose-400', badge: 'bg-rose-400/10 text-rose-300' }
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

	type InternalQuickLink = '/status' | '/logs' | '/admin';

	function openLink(link: { url: string; external: boolean }) {
		if (link.external) {
			const opened = window.open(link.url, '_blank', 'noreferrer');
			if (opened) opened.opener = null;
			return;
		}

		void goto(resolve(link.url as InternalQuickLink));
	}
</script>

<div class="page-shell">
	<header class="page-header">
		<div>
			<h1 class="page-title">Tableau de bord</h1>
			<p class="page-subtitle">Vue d'ensemble de l'infrastructure projet</p>
		</div>
		<a href={resolve('/status')} class="btn-secondary w-full sm:w-auto">
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 19V9m5 10V5m5 14v-7m5 7V3"
				/>
			</svg>
			État complet
		</a>
	</header>

	<div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
		<div class="panel p-4 sm:p-5">
			<p class="text-sm text-slate-400">Services suivis</p>
			<p class="mt-2 text-3xl font-semibold text-white">{data.monitoredServices.length}</p>
		</div>
		<div class="panel border-emerald-500/20 p-4 sm:p-5">
			<p class="text-sm text-slate-400">En ligne</p>
			<p class="mt-2 text-3xl font-semibold text-emerald-300">{onlineCount}</p>
		</div>
		<div class="panel border-amber-500/20 p-4 sm:p-5">
			<p class="text-sm text-slate-400">Dégradés</p>
			<p class="mt-2 text-3xl font-semibold text-amber-300">{degradedCount}</p>
		</div>
		<div class="panel border-rose-500/20 p-4 sm:p-5">
			<p class="text-sm text-slate-400">Hors ligne</p>
			<p class="mt-2 text-3xl font-semibold text-rose-300">{offlineCount}</p>
		</div>
	</div>

	<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
		<section>
			<div class="mb-3 flex items-center justify-between gap-3">
				<h2 class="section-label">Accès rapide</h2>
			</div>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{#each quickLinks as link (link.url)}
					<button
						type="button"
						onclick={() => openLink(link)}
						class="panel panel-hover grid min-h-24 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-4 p-4 text-left"
					>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-md bg-sky-500/10 text-sky-300"
						>
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.7"
									d={link.icon}
								/>
							</svg>
						</div>
						<div class="min-w-0 self-center">
							<p class="truncate text-sm font-medium text-white">{link.name}</p>
							<p class="truncate text-xs text-slate-500">{link.description}</p>
						</div>
					</button>
				{/each}
			</div>
		</section>

		<section>
			<div class="mb-3 flex items-center justify-between gap-3">
				<h2 class="section-label">État monitoré</h2>
				<a href={resolve('/status')} class="text-xs text-sky-300 hover:text-sky-200">Voir tout</a>
			</div>
			<div class="space-y-2">
				{#if data.monitoredServices.length === 0}
					<div class="panel px-4 py-6 text-sm text-slate-500">Aucun service monitoré.</div>
				{:else}
					{#each data.monitoredServices as service (service.id)}
						{@const cfg = statusConfig[service.status] ?? statusConfig.offline}
						<div class="panel px-4 py-3">
							<div class="flex items-center justify-between gap-3">
								<div class="min-w-0">
									<p class="truncate text-sm font-medium text-white">{service.name}</p>
									<p class="truncate text-xs text-slate-500">{service.host}</p>
								</div>
								<span class="status-pill flex-shrink-0 {cfg.badge}">
									<span class="h-1.5 w-1.5 rounded-full {cfg.dot}"></span>
									{cfg.label}
								</span>
							</div>
							<p class="mt-2 text-xs text-slate-500">
								{service.checkType.toUpperCase()} · {formatLatency(service.latencyMs)} · {formatDate(
									service.checkedAt
								)}
							</p>
						</div>
					{/each}
				{/if}
			</div>
		</section>
	</div>

	<section class="mt-6">
		<div class="mb-3 flex items-center justify-between gap-3">
			<h2 class="section-label">Activité récente</h2>
			<a href={resolve('/logs')} class="text-xs text-sky-300 hover:text-sky-200"
				>Voir les journaux</a
			>
		</div>
		<div class="panel">
			{#if data.recentActivity.length === 0}
				<p class="px-4 py-5 text-sm text-slate-500">Aucune activité récente enregistrée.</p>
			{:else}
				<div class="divide-y divide-slate-800">
					{#each data.recentActivity as log (log.id)}
						<div
							class="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4"
						>
							<div class="min-w-0">
								<div class="flex min-w-0 items-center gap-2">
									<span
										class="rounded px-2 py-0.5 text-xs font-medium {log.type === 'audit'
											? 'bg-sky-400/10 text-sky-300'
											: log.level === 'ERROR'
												? 'bg-rose-400/10 text-rose-300'
												: log.level === 'WARN'
													? 'bg-amber-400/10 text-amber-300'
													: 'bg-slate-400/10 text-slate-300'}"
									>
										{log.type === 'audit' ? 'Intranet' : log.level}
									</span>
									<p class="truncate text-sm text-slate-200">{log.label}</p>
								</div>
								{#if log.detail}
									<p class="mt-1 truncate text-xs text-slate-500">{log.detail}</p>
								{/if}
							</div>
							<p class="text-xs whitespace-nowrap text-slate-500">{formatDate(log.createdAt)}</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</div>
