<script lang="ts">
	import { onMount } from 'svelte';

	let username = $state('');
	let displayName = $state('');
	let email = $state('');

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	let profileSaved = $state(false);
	let profileError = $state('');
	let passwordSaved = $state(false);
	let passwordError = $state('');

	onMount(() => {
		const raw = sessionStorage.getItem('user');
		if (raw) {
			try {
				const user = JSON.parse(raw);
				username = user.username ?? '';
				displayName = user.name ?? user.username ?? '';
				email = user.email ?? '';
			} catch {}
		}
	});

	async function saveProfile(e: SubmitEvent) {
		e.preventDefault();
		profileSaved = false;
		profileError = '';

		if (!displayName.trim()) {
			profileError = 'Le nom affiché ne peut pas être vide.';
			return;
		}

		await new Promise((r) => setTimeout(r, 400));

		const raw = sessionStorage.getItem('user');
		const user = raw ? JSON.parse(raw) : {};
		sessionStorage.setItem('user', JSON.stringify({ ...user, name: displayName, email }));
		profileSaved = true;
		setTimeout(() => (profileSaved = false), 3000);
	}

	async function changePassword(e: SubmitEvent) {
		e.preventDefault();
		passwordSaved = false;
		passwordError = '';

		if (!currentPassword) {
			passwordError = 'Veuillez saisir votre mot de passe actuel.';
			return;
		}
		if (newPassword.length < 8) {
			passwordError = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
			return;
		}
		if (newPassword !== confirmPassword) {
			passwordError = 'Les mots de passe ne correspondent pas.';
			return;
		}

		await new Promise((r) => setTimeout(r, 400));

		passwordSaved = true;
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
		setTimeout(() => (passwordSaved = false), 3000);
	}

	const passwordChecks = $derived([
		{ ok: newPassword.length >= 8, label: 'Au moins 8 caractères' },
		{ ok: /[A-Z]/.test(newPassword), label: 'Une majuscule' },
		{ ok: /[0-9]/.test(newPassword), label: 'Un chiffre' },
		{ ok: confirmPassword === newPassword && confirmPassword !== '', label: 'Les mots de passe correspondent' }
	]);

	const initials = $derived(
		displayName
			? displayName
					.split(' ')
					.map((w) => w[0])
					.join('')
					.slice(0, 2)
					.toUpperCase()
			: '?'
	);
</script>

<div class="p-8">
	<header class="mb-8">
		<h1 class="text-2xl font-bold text-white">Mon profil</h1>
		<p class="mt-1 text-sm text-slate-400">Gérez vos informations personnelles et votre sécurité</p>
	</header>

	<div class="mx-auto max-w-2xl space-y-6">
		<!-- Avatar + identifiant -->
		<div class="flex items-center gap-5 rounded-xl border border-slate-800 bg-slate-900 p-6">
			<div
				class="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
			>
				{initials}
			</div>
			<div>
				<p class="text-lg font-semibold text-white">{displayName || username}</p>
				<p class="text-sm text-slate-400">@{username}</p>
				<span
					class="mt-1 inline-flex items-center gap-1.5 rounded-full bg-green-400/10 px-2.5 py-0.5 text-xs font-medium text-green-400"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-green-400"></span>
					Connecté
				</span>
			</div>
		</div>

		<!-- Informations du profil -->
		<section class="rounded-xl border border-slate-800 bg-slate-900">
			<div class="border-b border-slate-800 px-6 py-4">
				<h2 class="font-semibold text-white">Informations personnelles</h2>
			</div>
			<form onsubmit={saveProfile} class="space-y-4 p-6">
				{#if profileSaved}
					<div class="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
						Profil mis à jour avec succès.
					</div>
				{/if}
				{#if profileError}
					<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
						{profileError}
					</div>
				{/if}

				<div>
					<label for="username" class="mb-1.5 block text-sm font-medium text-slate-300">
						Identifiant
					</label>
					<input
						id="username"
						type="text"
						value={username}
						disabled
						class="w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-500"
					/>
					<p class="mt-1 text-xs text-slate-600">L'identifiant ne peut pas être modifié.</p>
				</div>

				<div>
					<label for="displayName" class="mb-1.5 block text-sm font-medium text-slate-300">
						Nom affiché
					</label>
					<input
						id="displayName"
						type="text"
						bind:value={displayName}
						placeholder="Votre nom complet"
						class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="email" class="mb-1.5 block text-sm font-medium text-slate-300">
						Adresse e-mail
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="vous@exemple.fr"
						class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div class="flex justify-end pt-2">
					<button
						type="submit"
						class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
					>
						Enregistrer
					</button>
				</div>
			</form>
		</section>

		<!-- Sécurité / mot de passe -->
		<section class="rounded-xl border border-slate-800 bg-slate-900">
			<div class="border-b border-slate-800 px-6 py-4">
				<h2 class="font-semibold text-white">Sécurité</h2>
			</div>
			<form onsubmit={changePassword} class="space-y-4 p-6">
				{#if passwordSaved}
					<div class="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
						Mot de passe modifié avec succès.
					</div>
				{/if}
				{#if passwordError}
					<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
						{passwordError}
					</div>
				{/if}

				<div>
					<label for="currentPassword" class="mb-1.5 block text-sm font-medium text-slate-300">
						Mot de passe actuel
					</label>
					<input
						id="currentPassword"
						type="password"
						bind:value={currentPassword}
						placeholder="••••••••"
						autocomplete="current-password"
						class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="newPassword" class="mb-1.5 block text-sm font-medium text-slate-300">
							Nouveau mot de passe
						</label>
						<input
							id="newPassword"
							type="password"
							bind:value={newPassword}
							placeholder="••••••••"
							autocomplete="new-password"
							class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="confirmPassword" class="mb-1.5 block text-sm font-medium text-slate-300">
							Confirmer
						</label>
						<input
							id="confirmPassword"
							type="password"
							bind:value={confirmPassword}
							placeholder="••••••••"
							autocomplete="new-password"
							class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
				</div>

				{#if newPassword}
					<div class="space-y-1">
						{#each passwordChecks as check}
							<p class="flex items-center gap-2 text-xs {check.ok ? 'text-green-400' : 'text-slate-500'}">
								<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									{#if check.ok}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
									{:else}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
									{/if}
								</svg>
								{check.label}
							</p>
						{/each}
					</div>
				{/if}

				<div class="flex justify-end pt-2">
					<button
						type="submit"
						class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
					>
						Changer le mot de passe
					</button>
				</div>
			</form>
		</section>
	</div>
</div>
