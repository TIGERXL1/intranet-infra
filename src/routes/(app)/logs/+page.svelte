<script lang="ts">
	import { resolve } from '$app/paths';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const ACTION_LABELS: Record<string, string> = {
		'auth.login.success': 'Connexion réussie',
		'auth.login.failure': 'Échec de connexion',
		'auth.logout': 'Déconnexion',
		'user.create': 'Compte créé',
		'user.activate': 'Compte activé',
		'user.deactivate': 'Compte désactivé',
		'user.delete': 'Compte supprimé',
		'user.password_reset': 'MDP réinitialisé',
		'user.profile_update': 'Profil modifié',
		'user.password_change': 'MDP modifié'
	};

	const ACTION_STYLE: Record<string, string> = {
		'auth.login.success': 'bg-emerald-400/10 text-emerald-300',
		'auth.login.failure': 'bg-rose-400/10 text-rose-300',
		'auth.logout': 'bg-slate-400/10 text-slate-300',
		'user.create': 'bg-sky-400/10 text-sky-300',
		'user.activate': 'bg-emerald-400/10 text-emerald-300',
		'user.deactivate': 'bg-amber-400/10 text-amber-300',
		'user.delete': 'bg-rose-400/10 text-rose-300',
		'user.password_reset': 'bg-orange-400/10 text-orange-300',
		'user.profile_update': 'bg-sky-400/10 text-sky-300',
		'user.password_change': 'bg-orange-400/10 text-orange-300'
	};

	const LEVEL_STYLE: Record<string, string> = {
		INFO: 'bg-sky-400/10 text-sky-300',
		WARN: 'bg-amber-400/10 text-amber-300',
		ERROR: 'bg-rose-400/10 text-rose-300'
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
		d
			? new Date(d).toLocaleString('fr-FR', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				})
			: '-';

	const formatActor = (log: (typeof data.auditLogs)[number]) =>
		log.actorUsername ? (log.actorDisplayName ?? log.actorUsername) : 'Système';

	const buildUrl = (overrides: Record<string, string | number>) => {
		const p = new SvelteURLSearchParams();
		p.set('tab', data.tab);
		if (filterAction) p.set('action', filterAction);
		if (filterService) p.set('service', filterService);
		if (filterLevel) p.set('level', filterLevel);
		if (filterFrom) p.set('from', filterFrom);
		if (filterTo) p.set('to', filterTo);
		Object.entries(overrides).forEach(([k, v]) => p.set(k, String(v)));
		return `/logs?${p.toString()}`;
	};

	type LogsHref = `/logs?${string}`;
</script>

<div class="page-shell">
	<header class="page-header">
		<div>
			<h1 class="page-title">Journaux</h1>
			<p class="page-subtitle">Accès réservé aux administrateurs</p>
		</div>
	</header>

	<div
		class="mb-5 inline-flex w-full gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1 sm:w-auto"
	>
		<a
			href={resolve('/logs?tab=audit')}
			class="flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors sm:flex-none sm:px-4 {data.tab ===
			'audit'
				? 'bg-sky-600 text-white'
				: 'text-slate-400 hover:text-slate-200'}"
		>
			Activité intranet
		</a>
		<a
			href={resolve('/logs?tab=services')}
			class="flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors sm:flex-none sm:px-4 {data.tab ===
			'services'
				? 'bg-sky-600 text-white'
				: 'text-slate-400 hover:text-slate-200'}"
		>
			Journaux services
		</a>
	</div>

	<form method="get" class="panel mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
		<input type="hidden" name="tab" value={data.tab} />

		{#if data.tab === 'audit'}
			<select name="action" bind:value={filterAction} class="form-field lg:col-span-2">
				<option value="">Toutes les actions</option>
				{#each ALL_ACTIONS as action (action)}
					<option value={action}>{ACTION_LABELS[action]}</option>
				{/each}
			</select>
		{:else}
			<select name="service" bind:value={filterService} class="form-field lg:col-span-2">
				<option value="">Tous les services</option>
				{#each data.serviceList as svc (svc.id)}
					<option value={svc.id}>{svc.name}</option>
				{/each}
			</select>
			<select name="level" bind:value={filterLevel} class="form-field">
				<option value="">Tous les niveaux</option>
				{#each LEVELS as lvl (lvl)}
					<option value={lvl}>{lvl}</option>
				{/each}
			</select>
		{/if}

		<input type="date" name="from" bind:value={filterFrom} class="form-field" />
		<input type="date" name="to" bind:value={filterTo} class="form-field" />

		<div class="flex gap-2 sm:col-span-2 lg:col-span-2">
			<button type="submit" class="btn-primary flex-1">Filtrer</button>
			<a href={resolve(`/logs?tab=${data.tab}`)} class="btn-ghost flex-1">Réinitialiser</a>
		</div>
	</form>

	{#if data.tab === 'audit'}
		<div class="table-wrap">
			{#if data.auditLogs.length === 0}
				<div class="py-16 text-center text-sm text-slate-500">
					Aucun journal ne correspond aux filtres.
				</div>
			{:else}
				<table class="data-table min-w-[980px]">
					<thead>
						<tr>
							<th class="w-48">Date</th>
							<th>Action</th>
							<th>Acteur</th>
							<th>Cible / Détail</th>
							<th>IP</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-800/60">
						{#each data.auditLogs as log (log.id)}
							<tr class="transition-colors hover:bg-slate-800/35">
								<td class="font-mono text-xs whitespace-nowrap text-slate-500"
									>{formatDate(log.createdAt)}</td
								>
								<td>
									<span
										class="rounded px-2 py-0.5 text-xs font-medium {ACTION_STYLE[log.action] ??
											'bg-slate-700 text-slate-300'}"
									>
										{ACTION_LABELS[log.action] ?? log.action}
									</span>
								</td>
								<td class="text-slate-300">{formatActor(log)}</td>
								<td class="max-w-md text-slate-400">
									{#if log.metadata && typeof log.metadata === 'object'}
										{@const meta = log.metadata as Record<string, unknown>}
										<div class="flex flex-wrap items-center gap-2">
											{#if meta.username}<span class="text-slate-300">@{meta.username}</span>{/if}
											{#if meta.role}<span class="text-xs text-slate-500">({meta.role})</span>{/if}
											{#if meta.reason}<span class="break-words text-slate-500">{meta.reason}</span
												>{/if}
										</div>
									{:else}
										<span class="text-slate-600">-</span>
									{/if}
								</td>
								<td class="font-mono text-xs whitespace-nowrap text-slate-500"
									>{log.ipAddress ?? '-'}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
				<div
					class="flex items-center justify-between gap-3 border-t border-slate-800 px-4 py-4 sm:px-6"
				>
					<span class="text-xs text-slate-500">Page {data.page}</span>
					<div class="flex gap-2">
						{#if data.page > 1}
							<a
								href={resolve(buildUrl({ page: data.page - 1 }) as LogsHref)}
								class="btn-secondary min-h-8 px-3 py-1.5 text-xs">Précédent</a
							>
						{/if}
						{#if data.hasMore}
							<a
								href={resolve(buildUrl({ page: data.page + 1 }) as LogsHref)}
								class="btn-secondary min-h-8 px-3 py-1.5 text-xs">Suivant</a
							>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="table-wrap">
			{#if data.serviceLogs.length === 0}
				<div class="py-16 text-center text-sm text-slate-500">
					Aucun journal de service disponible.
					{#if data.serviceList.length > 0}
						<p class="mt-2 text-xs">
							La collecte SSH tourne toutes les 5 minutes depuis le serveur de production.
						</p>
					{/if}
				</div>
			{:else}
				<table class="data-table min-w-[980px]">
					<thead>
						<tr>
							<th class="w-48">Horodatage</th>
							<th class="w-28">Niveau</th>
							<th class="w-40">Service</th>
							<th>Message</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-800/60">
						{#each data.serviceLogs as log (log.id)}
							<tr class="transition-colors hover:bg-slate-800/35">
								<td class="font-mono text-xs whitespace-nowrap text-slate-500"
									>{formatDate(log.loggedAt)}</td
								>
								<td>
									<span
										class="rounded px-2 py-0.5 text-xs font-medium {LEVEL_STYLE[log.level] ??
											'bg-slate-700 text-slate-300'}"
									>
										{log.level}
									</span>
								</td>
								<td class="text-slate-400">{log.serviceName ?? '-'}</td>
								<td class="max-w-4xl break-words text-slate-200">{log.message}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<div
					class="flex items-center justify-between gap-3 border-t border-slate-800 px-4 py-4 sm:px-6"
				>
					<span class="text-xs text-slate-500">Page {data.page}</span>
					<div class="flex gap-2">
						{#if data.page > 1}
							<a
								href={resolve(buildUrl({ page: data.page - 1 }) as LogsHref)}
								class="btn-secondary min-h-8 px-3 py-1.5 text-xs">Précédent</a
							>
						{/if}
						{#if data.hasMore}
							<a
								href={resolve(buildUrl({ page: data.page + 1 }) as LogsHref)}
								class="btn-secondary min-h-8 px-3 py-1.5 text-xs">Suivant</a
							>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
