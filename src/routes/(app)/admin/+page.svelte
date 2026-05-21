<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showCreateForm = $state(false);
	let resetTargetId = $state<string | null>(null);

	const f = $derived(form as Record<string, unknown> | null);

	const formatDate = (d: Date | null) =>
		d
			? new Date(d).toLocaleDateString('fr-FR', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})
			: '—';
</script>

<div class="page-shell">
	<header class="page-header">
		<div>
			<h1 class="page-title">Administration</h1>
			<p class="page-subtitle">{data.users.length} compte{data.users.length > 1 ? 's' : ''}</p>
		</div>
		<button
			type="button"
			onclick={() => (showCreateForm = !showCreateForm)}
			class="btn-primary w-full sm:w-auto"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Nouveau compte
		</button>
	</header>

	{#if f?.toggleError || f?.deleteError}
		<div
			class="mb-4 rounded-md border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
		>
			{f?.toggleError ?? f?.deleteError}
		</div>
	{/if}

	{#if showCreateForm}
		<div class="panel mb-6 p-5">
			<h2 class="mb-4 font-semibold text-white">Nouveau compte</h2>

			{#if f?.createError}
				<div
					class="mb-4 rounded-md border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
				>
					{f?.createError}
				</div>
			{/if}
			{#if f?.createSuccess}
				<div
					class="mb-4 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
				>
					Compte créé.
				</div>
			{/if}

			<form
				method="post"
				action="?/create"
				class="grid gap-4 md:grid-cols-2"
				use:enhance={() =>
					async ({ result, update }) => {
						await update();
						if (result.type === 'success') showCreateForm = false;
					}}
			>
				<div>
					<label for="new-username" class="mb-1.5 block text-sm font-medium text-slate-300"
						>Identifiant</label
					>
					<input
						id="new-username"
						name="username"
						type="text"
						required
						autocomplete="off"
						class="form-field"
					/>
				</div>
				<div>
					<label for="new-role" class="mb-1.5 block text-sm font-medium text-slate-300">Rôle</label>
					<select id="new-role" name="role" class="form-field">
						<option value="user">Utilisateur</option>
						<option value="admin">Administrateur</option>
					</select>
				</div>
				<div>
					<label for="new-password" class="mb-1.5 block text-sm font-medium text-slate-300"
						>Mot de passe</label
					>
					<input
						id="new-password"
						name="password"
						type="password"
						required
						autocomplete="new-password"
						class="form-field"
					/>
				</div>
				<div>
					<label for="new-confirm" class="mb-1.5 block text-sm font-medium text-slate-300"
						>Confirmer</label
					>
					<input
						id="new-confirm"
						name="confirmPassword"
						type="password"
						required
						autocomplete="new-password"
						class="form-field"
					/>
				</div>
				<div class="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end md:col-span-2">
					<button type="button" onclick={() => (showCreateForm = false)} class="btn-ghost"
						>Annuler</button
					>
					<button type="submit" class="btn-primary">Créer</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="table-wrap">
		<table class="data-table min-w-[1100px]">
			<thead>
				<tr>
					<th>Compte</th>
					<th>Rôle</th>
					<th>État</th>
					<th>Dernière connexion</th>
					<th>Créé le</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-800/70">
				{#each data.users as user (user.id)}
					<tr class="transition-colors hover:bg-slate-800/35">
						<td>
							<div class="flex items-center gap-3">
								<div
									class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300"
								>
									{user.username[0].toUpperCase()}
								</div>
								<div class="min-w-0">
									<p class="truncate font-medium text-white">{user.displayName ?? user.username}</p>
									{#if user.displayName}
										<p class="truncate text-xs text-slate-500">@{user.username}</p>
									{/if}
								</div>
							</div>
						</td>
						<td>
							<span
								class="rounded px-2 py-0.5 text-xs font-medium {user.role === 'admin'
									? 'bg-violet-400/10 text-violet-300'
									: 'bg-slate-700 text-slate-300'}"
							>
								{user.role === 'admin' ? 'Admin' : 'Utilisateur'}
							</span>
						</td>
						<td>
							<span
								class="inline-flex items-center gap-1.5 text-xs font-medium {user.isActive
									? 'text-emerald-300'
									: 'text-slate-500'}"
							>
								<span
									class="h-1.5 w-1.5 rounded-full {user.isActive
										? 'bg-emerald-400'
										: 'bg-slate-500'}"
								></span>
								{user.isActive ? 'Actif' : 'Inactif'}
							</span>
						</td>
						<td class="whitespace-nowrap text-slate-400">{formatDate(user.lastLoginAt)}</td>
						<td class="whitespace-nowrap text-slate-400">{formatDate(user.createdAt)}</td>
						<td>
							<div class="flex items-center justify-end gap-2">
								<form method="post" action="?/toggleActive" use:enhance>
									<input type="hidden" name="userId" value={user.id} />
									<button
										type="submit"
										title={user.isActive ? 'Désactiver' : 'Activer'}
										class="icon-button"
									>
										{#if user.isActive}
											<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
												/>
											</svg>
										{:else}
											<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
										{/if}
									</button>
								</form>

								<button
									type="button"
									onclick={() => (resetTargetId = resetTargetId === user.id ? null : user.id)}
									title="Réinitialiser le mot de passe"
									class="icon-button"
								>
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
										/>
									</svg>
								</button>

								<form
									method="post"
									action="?/deleteUser"
									use:enhance
									onsubmit={(e) => {
										if (!confirm(`Supprimer @${user.username} ?`)) e.preventDefault();
									}}
								>
									<input type="hidden" name="userId" value={user.id} />
									<button
										type="submit"
										title="Supprimer"
										class="icon-button hover:bg-rose-500/20 hover:text-rose-300"
									>
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</form>
							</div>

							{#if resetTargetId === user.id}
								<form
									method="post"
									action="?/resetPassword"
									class="mt-3 w-72 max-w-full space-y-2 rounded-md border border-slate-800 bg-slate-950/40 p-3"
									use:enhance={() =>
										async ({ result, update }) => {
											await update();
											if (result.type === 'success') resetTargetId = null;
										}}
								>
									<input type="hidden" name="userId" value={user.id} />
									{#if f?.resetError && f?.resetUserId === user.id}
										<p class="text-xs text-rose-300">{f?.resetError}</p>
									{/if}
									<input
										name="newPassword"
										type="password"
										placeholder="Nouveau mot de passe"
										autocomplete="new-password"
										class="form-field py-2 text-xs"
									/>
									<input
										name="confirmPassword"
										type="password"
										placeholder="Confirmer"
										autocomplete="new-password"
										class="form-field py-2 text-xs"
									/>
									<div class="flex gap-2">
										<button type="submit" class="btn-primary min-h-8 px-3 py-1.5 text-xs"
											>Valider</button
										>
										<button
											type="button"
											onclick={() => (resetTargetId = null)}
											class="btn-ghost min-h-8 px-3 py-1.5 text-xs">Annuler</button
										>
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
