<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const displayName = $derived(data.profile?.displayName ?? data.profile?.username ?? '?');
	const initials = $derived(
		displayName
			.split(' ')
			.map((w: string) => w[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);

	const formatDate = (d: Date | null) =>
		d
			? new Date(d).toLocaleDateString('fr-FR', {
					day: '2-digit',
					month: 'long',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})
			: '—';
</script>

<div class="page-shell">
	<header class="page-header">
		<div>
			<h1 class="page-title">Mon profil</h1>
			<p class="page-subtitle">Informations du compte connecté</p>
		</div>
	</header>

	<div class="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
		<div class="panel p-6">
			<div class="flex flex-col items-center text-center">
				<div
					class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-sky-600 text-2xl font-semibold text-white"
				>
					{initials}
				</div>
				<p class="mt-4 text-lg font-semibold text-white">{displayName}</p>
				<p class="text-sm text-slate-400">@{data.profile?.username}</p>
				<span class="status-pill mt-3 bg-emerald-400/10 text-emerald-300">
					<span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
					{data.profile?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
				</span>
			</div>
		</div>

		<div class="panel divide-y divide-slate-800">
			<div class="grid gap-1 px-5 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
				<span class="text-sm text-slate-400">E-mail</span>
				<span class="text-sm break-words text-slate-200">{data.profile?.email ?? '—'}</span>
			</div>
			<div class="grid gap-1 px-5 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
				<span class="text-sm text-slate-400">Dernière connexion</span>
				<span class="text-sm text-slate-200">{formatDate(data.profile?.lastLoginAt ?? null)}</span>
			</div>
			<div class="grid gap-1 px-5 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
				<span class="text-sm text-slate-400">Membre depuis</span>
				<span class="text-sm text-slate-200">{formatDate(data.profile?.createdAt ?? null)}</span>
			</div>
		</div>
	</div>
</div>
