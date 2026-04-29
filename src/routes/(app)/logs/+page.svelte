<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const ACTION_LABELS: Record<string, string> = {
		'auth.login.success': 'Connexion reussie',
		'auth.login.failure': 'Echec de connexion',
		'auth.logout': 'Deconnexion',
		'user.create': 'Compte cree',
		'user.activate': 'Compte active',
		'user.deactivate': 'Compte desactive',
		'user.delete': 'Compte supprime',
		'user.password_reset': 'MDP reinitialise',
		'user.profile_update': 'Profil modifie',
		'user.password_change': 'MDP modifie'
	};

	const ACTION_STYLE: Record<string, string> = {
		'auth.login.success': 'bg-green-400/10 text-green-400',
		'auth.login.failure': 'bg-red-400/10 text-red-400',
		'auth.logout': 'bg-slate-400/10 text-slate-400',
		'user.create': 'bg-blue-400/10 text-blue-400',
		'user.activate': 'bg-green-400/10 text-green-400',
		'user.deactivate': 'bg-yellow-400/10 text-yellow-400',
		'user.delete': 'bg-red-400/10 text-red-400',
		'user.password_reset': 'bg-orange-400/10 text-orange-400',
		'user.profile_update': 'bg-blue-400/10 text-blue-400',
		'user.password_change': 'bg-orange-400/10 text-orange-400'
	};

	const LEVEL_STYLE: Record<string, string> = {
		INFO: 'bg-blue-400/10 text-blue-400',
		WARN: 'bg-yellow-400/10 text-yellow-400',
		ERROR: 'bg-red-400/10 text-red-400'
	};

	const ALL_ACTIONS = Object.keys(ACTION_LABELS);
	const LEVELS = ['INFO', 'WARN', 'ERROR'];

	let filterAction = $state('');
	let filterService = $state('');
	let filterLevel = $state('');
	let filterFrom = $state('');
	let filterTo = $state('');

	$effect(() => {
		filterAction = data.filters.action;
		filterService = data.filters.service;
		filterLevel = data.filters.level;
		filterFrom = data.filters.from;
		filterTo = data.filters.to;
	});

	const formatDate = (d: Date | null) =>
		d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-';

	const formatActor = (log: (typeof data.auditLogs)[number]) =>
		log.actorUsername ? (log.actorDisplayName ?? log.actorUsername) : 'Systeme';

	const buildUrl = (overrides: Record<string, string | number>) => {
		const p = new URLSearchParams();
		p.set('tab', data.tab);
		if (filterAction) p.set('action', filterAction);
		if (filterService) p.set('service', filterService);
		if (filterLevel) p.set('level', filterLevel);
		if (filterFrom) p.set('from', filterFrom);
		if (filterTo) p.set('to', filterTo);
		Object.entries(overrides).forEach(([k, v]) => p.set(k, String(v)));
		return `/logs?${p.toString()}`;
	};
</script>

<div class="p-8">
	<header class="mb-8">
		<h1 class="text-2xl font-bold text-white">Journaux</h1>
		<p class="mt-1 text-sm text-slate-400">Acces reserve aux administrateurs</p>
	</header>

	<!-- Onglets -->
	<div class="mb-6 flex gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1 w-fit">
		<a
			href="/logs?tab=audit"
			class="rounded-lg px-4 py-2 text-sm font-medium transition-colors {data.tab === 'audit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}"
		>
			Activite intranet
		</a>
		<a
			href="/logs?tab=services"
			class="rounded-lg px-4 py-2 text-sm font-medium transition-colors {data.tab === 'services' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}"
		>
			Journaux services
		</a>
	</div>

	<!-- Filtres -->
	<form method="get" class="mb-6 flex flex-wrap gap-3">
		<input type="hidden" name="tab" value={data.tab} />

		{#if data.tab === 'audit'}
			<select name="action" bind:value={filterAction}
				class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none">
				<option value="">Toutes les actions</option>
				{#each ALL_ACTIONS as action}
					<option value={action}>{ACTION_LABELS[action]}</option>
				{/each}
			</select>
		{:else}
			<select name="service" bind:value={filterService}
				class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none">
				<option value="">Tous les services</option>
				{#each data.serviceList as svc}
					<option value={svc.id}>{svc.name}</option>
				{/each}
			</select>
			<select name="level" bind:value={filterLevel}
				class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none">
				<option value="">Tous les niveaux</option>
				{#each LEVELS as lvl}
					<option value={lvl}>{lvl}</option>
				{/each}
			</select>
		{/if}

		<input type="date" name="from" bind:value={filterFrom}
			class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none" />
		<input type="date" name="to" bind:value={filterTo}
			class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none" />

		<button type="submit"
			class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
			Filtrer
		</button>
		<a href="/logs?tab={data.tab}"
			class="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800">
			Reinitialiser
		</a>
	</form>

	<!-- Contenu onglet audit -->
	{#if data.tab === 'audit'}
		<div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
			{#if data.auditLogs.length === 0}
				<div class="py-16 text-center text-slate-500">Aucun journal ne correspond aux filtres.</div>
			{:else}
				<table class="w-full">
					<thead>
						<tr class="border-b border-slate-800">
							<th class="w-44 px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Date</th>
							<th class="px-4 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Action</th>
							<th class="px-4 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Acteur</th>
							<th class="px-4 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Cible / Detail</th>
							<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">IP</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-800/50">
						{#each data.auditLogs as log}
							<tr class="transition-colors hover:bg-slate-800/30">
								<td class="px-6 py-3.5 font-mono text-xs text-slate-500">{formatDate(log.createdAt)}</td>
								<td class="px-4 py-3.5">
									<span class="rounded px-2 py-0.5 text-xs font-medium {ACTION_STYLE[log.action] ?? 'bg-slate-700 text-slate-300'}">
										{ACTION_LABELS[log.action] ?? log.action}
									</span>
								</td>
								<td class="px-4 py-3.5 text-sm text-slate-300">{formatActor(log)}</td>
								<td class="px-4 py-3.5 text-sm text-slate-400">
									{#if log.metadata && typeof log.metadata === 'object'}
										{@const meta = log.metadata as Record<string, unknown>}
										{#if meta.username}<span class="text-slate-300">@{meta.username}</span>{/if}
										{#if meta.role}<span class="ml-2 text-xs text-slate-500">({meta.role})</span>{/if}
										{#if meta.reason}<span class="text-slate-500">{meta.reason}</span>{/if}
									{/if}
								</td>
								<td class="px-6 py-3.5 font-mono text-xs text-slate-500">{log.ipAddress ?? '-'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<div class="flex items-center justify-between border-t border-slate-800 px-6 py-4">
					<span class="text-xs text-slate-500">Page {data.page}</span>
					<div class="flex gap-2">
						{#if data.page > 1}
							<a href={buildUrl({ page: data.page - 1 })} class="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">Precedent</a>
						{/if}
						{#if data.hasMore}
							<a href={buildUrl({ page: data.page + 1 })} class="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">Suivant</a>
						{/if}
					</div>
				</div>
			{/if}
		</div>

	<!-- Contenu onglet services -->
	{:else}
		<div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
			{#if data.serviceLogs.length === 0}
				<div class="py-16 text-center text-slate-500">
					Aucun journal de service disponible.
					{#if data.serviceList.length > 0}
						<p class="mt-2 text-xs">La collecte SSH tourne toutes les 5 minutes depuis le serveur de production.</p>
					{/if}
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
						{#each data.serviceLogs as log}
							<tr class="transition-colors hover:bg-slate-800/30">
								<td class="px-6 py-3.5 font-mono text-xs text-slate-500">{formatDate(log.loggedAt)}</td>
								<td class="px-4 py-3.5">
									<span class="rounded px-2 py-0.5 text-xs font-medium {LEVEL_STYLE[log.level] ?? 'bg-slate-700 text-slate-300'}">
										{log.level}
									</span>
								</td>
								<td class="px-4 py-3.5 text-sm text-slate-400">{log.serviceName ?? '-'}</td>
								<td class="px-6 py-3.5 text-sm text-slate-200">{log.message}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<div class="flex items-center justify-between border-t border-slate-800 px-6 py-4">
					<span class="text-xs text-slate-500">Page {data.page}</span>
					<div class="flex gap-2">
						{#if data.page > 1}
							<a href={buildUrl({ page: data.page - 1 })} class="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">Precedent</a>
						{/if}
						{#if data.hasMore}
							<a href={buildUrl({ page: data.page + 1 })} class="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">Suivant</a>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
