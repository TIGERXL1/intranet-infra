<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Status = 'online' | 'degraded' | 'offline';

	let refreshing = $state(false);

	const statusConfig: Record<Status, { label: string; dot: string; badge: string; text: string }> =
		{
			online: {
				label: 'En ligne',
				dot: 'bg-emerald-400',
				badge: 'bg-emerald-400/10 text-emerald-300',
				text: 'text-emerald-300'
			},
			degraded: {
				label: 'Dégradé',
				dot: 'bg-amber-400',
				badge: 'bg-amber-400/10 text-amber-300',
				text: 'text-amber-300'
			},
			offline: {
				label: 'Hors ligne',
				dot: 'bg-rose-400',
				badge: 'bg-rose-400/10 text-rose-300',
				text: 'text-rose-300'
			}
		};

	const onlineCount = $derived(data.services.filter((s) => s.status === 'online').length);
	const degradedCount = $derived(data.services.filter((s) => s.status === 'degraded').length);
	const offlineCount = $derived(data.services.filter((s) => s.status === 'offline').length);

	const formatLatency = (ms: number | null) => (ms !== null ? `${ms} ms` : '-');
	const formatDate = (d: Date | null) =>
		d
			? new Date(d).toLocaleTimeString('fr-FR', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				})
			: '-';

	$effect(() => {
		const id = setInterval(() => void invalidateAll(), 60_000);
		return () => clearInterval(id);
	});
</script>

<div class="page-shell">
	<header class="page-header">
		<div>
			<h1 class="page-title">État des services</h1>
			<p class="page-subtitle">Vérification métier toutes les 60 secondes</p>
		</div>
		<form
			method="post"
			action="?/refresh"
			use:enhance={() => {
				refreshing = true;
				return async ({ update }) => {
					await update({ reset: false });
					refreshing = false;
				};
			}}
		>
			<button type="submit" disabled={refreshing} class="btn-secondary w-full sm:w-auto">
				<svg
					class="h-4 w-4 {refreshing ? 'animate-spin' : ''}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
				{refreshing ? 'Vérification...' : 'Vérifier maintenant'}
			</button>
		</form>
	</header>

	<div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
		<div class="panel flex items-center gap-4 p-4 sm:p-5">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10">
				<span class="h-3 w-3 rounded-full bg-emerald-400"></span>
			</div>
			<div>
				<p class="text-2xl font-semibold text-white">{onlineCount}</p>
				<p class="text-sm text-slate-400">En ligne</p>
			</div>
		</div>
		<div class="panel flex items-center gap-4 p-4 sm:p-5">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10">
				<span class="h-3 w-3 rounded-full bg-amber-400"></span>
			</div>
			<div>
				<p class="text-2xl font-semibold text-white">{degradedCount}</p>
				<p class="text-sm text-slate-400">Dégradés</p>
			</div>
		</div>
		<div class="panel flex items-center gap-4 p-4 sm:p-5">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-rose-400/10">
				<span class="h-3 w-3 rounded-full bg-rose-400"></span>
			</div>
			<div>
				<p class="text-2xl font-semibold text-white">{offlineCount}</p>
				<p class="text-sm text-slate-400">Hors ligne</p>
			</div>
		</div>
	</div>

	{#if data.services.length === 0}
		<div class="panel py-16 text-center text-sm text-slate-500">
			Aucun service configuré. Lancez <code class="text-slate-300">npm run db:seed-services</code>.
		</div>
	{:else}
		<div class="table-wrap">
			<table class="data-table min-w-[900px]">
				<thead>
					<tr>
						<th>Service</th>
						<th>Statut</th>
						<th>Latence</th>
						<th>Moy. 24h</th>
						<th>Dispo 24h</th>
						<th>Dernière vérif.</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/70">
					{#each data.services as service (service.id)}
						{@const cfg = statusConfig[service.status]}
						<tr class="transition-colors hover:bg-slate-800/35">
							<td>
								<div>
									<p class="font-medium text-white">{service.name}</p>
									<p class="text-xs text-slate-500 uppercase">{service.checkType}</p>
								</div>
							</td>
							<td>
								<span class="status-pill {cfg.badge}">
									<span class="h-1.5 w-1.5 rounded-full {cfg.dot}"></span>
									{cfg.label}
								</span>
								{#if service.errorMsg}
									<p class="mt-1 max-w-xs text-xs break-words text-rose-300/75">
										{service.errorMsg}
									</p>
								{/if}
							</td>
							<td
								class="text-sm {service.latencyMs !== null && service.latencyMs > 500
									? 'text-amber-300'
									: 'text-slate-300'}"
							>
								{formatLatency(service.latencyMs)}
							</td>
							<td class="text-sm text-slate-400">
								{formatLatency(service.avgLatencyMs)}
							</td>
							<td>
								{#if service.uptimePct !== null}
									<div class="flex items-center gap-2">
										<div class="h-1.5 w-24 overflow-hidden rounded-full bg-slate-700">
											<div
												class="h-full rounded-full {service.uptimePct >= 99
													? 'bg-emerald-400'
													: service.uptimePct >= 95
														? 'bg-amber-400'
														: 'bg-rose-400'}"
												style="width: {service.uptimePct}%"
											></div>
										</div>
										<span class="text-sm text-slate-400">{service.uptimePct}%</span>
									</div>
								{:else}
									<span class="text-sm text-slate-600">-</span>
								{/if}
							</td>
							<td class="text-sm whitespace-nowrap text-slate-500">
								{formatDate(service.lastCheckedAt)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
