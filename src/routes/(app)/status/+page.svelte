<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Status = 'online' | 'degraded' | 'offline';

	let refreshing = $state(false);

	const statusConfig: Record<Status, { label: string; dot: string; badge: string }> = {
		online: { label: 'En ligne', dot: 'bg-green-400', badge: 'bg-green-400/10 text-green-400' },
		degraded: { label: 'Degrade', dot: 'bg-yellow-400', badge: 'bg-yellow-400/10 text-yellow-400' },
		offline: { label: 'Hors ligne', dot: 'bg-red-400', badge: 'bg-red-400/10 text-red-400' }
	};

	const onlineCount = $derived(data.services.filter((s) => s.status === 'online').length);
	const degradedCount = $derived(data.services.filter((s) => s.status === 'degraded').length);
	const offlineCount = $derived(data.services.filter((s) => s.status === 'offline').length);

	const formatLatency = (ms: number | null) => (ms !== null ? `${ms} ms` : '-');
	const formatDate = (d: Date | null) =>
		d ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-';

	// Auto-refresh toutes les 60s
	$effect(() => {
		const id = setInterval(() => void invalidateAll(), 60_000);
		return () => clearInterval(id);
	});
</script>

<div class="p-8">
	<header class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-white">Etat des services</h1>
			<p class="mt-1 text-sm text-slate-400">Verification metier toutes les 60 secondes</p>
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
			<button
				type="submit"
				disabled={refreshing}
				class="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
			>
				<svg
					class="h-4 w-4 {refreshing ? 'animate-spin' : ''}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				{refreshing ? 'Verification...' : 'Verifier maintenant'}
			</button>
		</form>
	</header>

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
				<p class="text-sm text-slate-400">Degrades</p>
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

	{#if data.services.length === 0}
		<div class="rounded-xl border border-slate-800 bg-slate-900 py-16 text-center text-slate-500">
			Aucun service configure. Lancez <code class="text-slate-400">npm run db:seed-services</code>.
		</div>
	{:else}
		<div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
			<table class="w-full">
				<thead>
					<tr class="border-b border-slate-800">
						<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Service</th>
						<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Statut</th>
						<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Latence</th>
						<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Moy. 24h</th>
						<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Dispo 24h</th>
						<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Derniere verif.</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800">
					{#each data.services as service}
						{@const cfg = statusConfig[service.status]}
						<tr class="transition-colors hover:bg-slate-800/50">
							<td class="px-6 py-4">
								<div>
									<p class="font-medium text-white">{service.name}</p>
									<p class="text-xs text-slate-500 uppercase">{service.checkType}</p>
								</div>
							</td>
							<td class="px-6 py-4">
								<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium {cfg.badge}">
									<span class="h-1.5 w-1.5 rounded-full {cfg.dot}"></span>
									{cfg.label}
								</span>
								{#if service.errorMsg}
									<p class="mt-1 text-xs text-red-400/70">{service.errorMsg}</p>
								{/if}
							</td>
							<td class="px-6 py-4 text-sm {service.latencyMs !== null && service.latencyMs > 500 ? 'text-yellow-400' : 'text-slate-300'}">
								{formatLatency(service.latencyMs)}
							</td>
							<td class="px-6 py-4 text-sm text-slate-400">
								{formatLatency(service.avgLatencyMs)}
							</td>
							<td class="px-6 py-4">
								{#if service.uptimePct !== null}
									<div class="flex items-center gap-2">
										<div class="h-1.5 w-20 overflow-hidden rounded-full bg-slate-700">
											<div
												class="h-full rounded-full {service.uptimePct >= 99 ? 'bg-green-400' : service.uptimePct >= 95 ? 'bg-yellow-400' : 'bg-red-400'}"
												style="width: {service.uptimePct}%"
											></div>
										</div>
										<span class="text-sm text-slate-400">{service.uptimePct}%</span>
									</div>
								{:else}
									<span class="text-sm text-slate-600">-</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-sm text-slate-500">
								{formatDate(service.lastCheckedAt)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
