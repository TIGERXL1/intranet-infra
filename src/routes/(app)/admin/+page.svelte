<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showCreateForm = $state(false);
	let resetTargetId = $state<string | null>(null);

	const f = $derived(form as Record<string, unknown> | null);

	const formatDate = (d: Date | null) =>
		d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
</script>

<div class="p-8">
	<header class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-white">Administration</h1>
			<p class="mt-1 text-sm text-slate-400">{data.users.length} compte{data.users.length > 1 ? 's' : ''}</p>
		</div>
		<button
			onclick={() => (showCreateForm = !showCreateForm)}
			class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Nouveau compte
		</button>
	</header>

	<!-- Create form -->
	{#if showCreateForm}
		<div class="mb-6 rounded-xl border border-slate-700 bg-slate-900 p-6">
			<h2 class="mb-4 font-semibold text-white">Nouveau compte</h2>

			{#if f?.createError}
				<div class="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
					{f?.createError}
				</div>
			{/if}
			{#if f?.createSuccess}
				<div class="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
					Compte créé.
				</div>
			{/if}

			<form
				method="post"
				action="?/create"
				class="grid grid-cols-2 gap-4"
				use:enhance={() => async ({ result, update }) => { await update(); if (result.type === 'success') showCreateForm = false; }}
			>
				<div>
					<label for="new-username" class="mb-1.5 block text-sm font-medium text-slate-300">Identifiant</label>
					<input id="new-username" name="username" type="text" required autocomplete="off"
						class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none" />
				</div>
				<div>
					<label for="new-role" class="mb-1.5 block text-sm font-medium text-slate-300">Rôle</label>
					<select id="new-role" name="role"
						class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none">
						<option value="user">Utilisateur</option>
						<option value="admin">Administrateur</option>
					</select>
				</div>
				<div>
					<label for="new-password" class="mb-1.5 block text-sm font-medium text-slate-300">Mot de passe</label>
					<input id="new-password" name="password" type="password" required autocomplete="new-password"
						class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none" />
				</div>
				<div>
					<label for="new-confirm" class="mb-1.5 block text-sm font-medium text-slate-300">Confirmer</label>
					<input id="new-confirm" name="confirmPassword" type="password" required autocomplete="new-password"
						class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none" />
				</div>
				<div class="col-span-2 flex justify-end gap-3 pt-2">
					<button type="button" onclick={() => (showCreateForm = false)}
						class="rounded-lg px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800">
						Annuler
					</button>
					<button type="submit"
						class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500">
						Créer
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- User table -->
	<div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
		<table class="w-full">
			<thead>
				<tr class="border-b border-slate-800">
					<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Compte</th>
					<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Rôle</th>
					<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">État</th>
					<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Dernière connexion</th>
					<th class="px-6 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">Créé le</th>
					<th class="px-6 py-3.5 text-right text-xs font-semibold tracking-wide text-slate-400 uppercase">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-800">
				{#each data.users as user}
					<tr class="hover:bg-slate-800/30 transition-colors">
						<td class="px-6 py-4">
							<div class="flex items-center gap-3">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300">
									{user.username[0].toUpperCase()}
								</div>
								<div>
									<p class="font-medium text-white">{user.displayName ?? user.username}</p>
									{#if user.displayName}
										<p class="text-xs text-slate-500">@{user.username}</p>
									{/if}
								</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<span class="rounded px-2 py-0.5 text-xs font-medium
								{user.role === 'admin' ? 'bg-purple-400/10 text-purple-400' : 'bg-slate-700 text-slate-400'}">
								{user.role === 'admin' ? 'Admin' : 'Utilisateur'}
							</span>
						</td>
						<td class="px-6 py-4">
							<span class="inline-flex items-center gap-1.5 text-xs font-medium
								{user.isActive ? 'text-green-400' : 'text-slate-500'}">
								<span class="h-1.5 w-1.5 rounded-full {user.isActive ? 'bg-green-400' : 'bg-slate-500'}"></span>
								{user.isActive ? 'Actif' : 'Inactif'}
							</span>
						</td>
						<td class="px-6 py-4 text-sm text-slate-400">{formatDate(user.lastLoginAt)}</td>
						<td class="px-6 py-4 text-sm text-slate-400">{formatDate(user.createdAt)}</td>
						<td class="px-6 py-4">
							<div class="flex items-center justify-end gap-2">
								<!-- Toggle active -->
								<form method="post" action="?/toggleActive" use:enhance>
									<input type="hidden" name="userId" value={user.id} />
									<button type="submit" title={user.isActive ? 'Désactiver' : 'Activer'}
										class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200">
										{#if user.isActive}
											<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
											</svg>
										{:else}
											<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										{/if}
									</button>
								</form>

								<!-- Reset password toggle -->
								<button
									onclick={() => (resetTargetId = resetTargetId === user.id ? null : user.id)}
									title="Réinitialiser le mot de passe"
									class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
								>
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
									</svg>
								</button>

								<!-- Delete -->
								<form method="post" action="?/deleteUser" use:enhance
									onsubmit={(e) => { if (!confirm(`Supprimer @${user.username} ?`)) e.preventDefault(); }}>
									<input type="hidden" name="userId" value={user.id} />
									<button type="submit" title="Supprimer"
										class="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400">
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</form>
							</div>

							<!-- Reset password inline form -->
							{#if resetTargetId === user.id}
								<form method="post" action="?/resetPassword" class="mt-3 space-y-2"
									use:enhance={() => async ({ result, update }) => { await update(); if (result.type === 'success') resetTargetId = null; }}>
									<input type="hidden" name="userId" value={user.id} />
									{#if f?.resetError && f?.resetUserId === user.id}
										<p class="text-xs text-red-400">{f?.resetError}</p>
									{/if}
									<input name="newPassword" type="password" placeholder="Nouveau mot de passe" autocomplete="new-password"
										class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none" />
									<input name="confirmPassword" type="password" placeholder="Confirmer" autocomplete="new-password"
										class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none" />
									<div class="flex gap-2">
										<button type="submit"
											class="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500">
											Valider
										</button>
										<button type="button" onclick={() => (resetTargetId = null)}
											class="rounded px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700">
											Annuler
										</button>
									</div>
								</form>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
