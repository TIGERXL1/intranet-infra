<script lang="ts">
	import { goto } from '$app/navigation';

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = '';

		await new Promise((r) => setTimeout(r, 500));

		if (username.trim() && password.trim()) {
			sessionStorage.setItem('user', JSON.stringify({ username, name: username }));
			goto('/dashboard');
		} else {
			error = 'Veuillez renseigner vos identifiants.';
		}
		loading = false;
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-950 p-4">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
				<svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
					/>
				</svg>
			</div>
			<h1 class="text-2xl font-bold text-white">Intranet</h1>
			<p class="mt-1 text-sm text-slate-400">Connectez-vous pour accéder aux services</p>
		</div>

		<form
			onsubmit={handleLogin}
			class="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
		>
			{#if error}
				<div
					class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
				>
					{error}
				</div>
			{/if}

			<div>
				<label for="username" class="mb-1.5 block text-sm font-medium text-slate-300">
					Identifiant
				</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					placeholder="Votre identifiant"
					autocomplete="username"
					class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="password" class="mb-1.5 block text-sm font-medium text-slate-300">
					Mot de passe
				</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="••••••••"
					autocomplete="current-password"
					class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading ? 'Connexion en cours...' : 'Se connecter'}
			</button>
		</form>
	</div>
</div>
