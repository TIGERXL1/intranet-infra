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

<div class="p-8">
	<header class="mb-8">
		<h1 class="text-2xl font-bold text-white">Mon profil</h1>
	</header>

	<div class="mx-auto max-w-lg space-y-4">
		<div class="flex items-center gap-5 rounded-xl border border-slate-800 bg-slate-900 p-6">
			<div
				class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
			>
				{initials}
			</div>
			<div>
				<p class="text-lg font-semibold text-white">{displayName}</p>
				<p class="text-sm text-slate-400">@{data.profile?.username}</p>
				<span
					class="mt-1 inline-flex items-center gap-1.5 rounded-full bg-green-400/10 px-2.5 py-0.5 text-xs font-medium text-green-400"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-green-400"></span>
					{data.profile?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
				</span>
			</div>
		</div>

		<div class="rounded-xl border border-slate-800 bg-slate-900 divide-y divide-slate-800">
			<div class="flex items-center justify-between px-6 py-4">
				<span class="text-sm text-slate-400">E-mail</span>
				<span class="text-sm text-slate-200">{data.profile?.email ?? '—'}</span>
			</div>
			<div class="flex items-center justify-between px-6 py-4">
				<span class="text-sm text-slate-400">Dernière connexion</span>
				<span class="text-sm text-slate-200">{formatDate(data.profile?.lastLoginAt ?? null)}</span>
			</div>
			<div class="flex items-center justify-between px-6 py-4">
				<span class="text-sm text-slate-400">Membre depuis</span>
				<span class="text-sm text-slate-200">{formatDate(data.profile?.createdAt ?? null)}</span>
			</div>
		</div>
	</div>
</div>
