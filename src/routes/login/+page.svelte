<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
	<div class="w-full max-w-md">
		<div class="mb-6 text-center">
			<div
				class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-sky-600 shadow-lg shadow-sky-950/40"
			>
				<svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
					/>
				</svg>
			</div>
			<h1 class="text-2xl font-semibold tracking-tight text-white">Intranet</h1>
		</div>

		<form
			method="post"
			class="panel space-y-4 p-5 sm:p-6"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
		>
			{#if form?.error}
				<div
					class="rounded-md border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
				>
					{form.error}
				</div>
			{/if}

			<div>
				<label for="username" class="mb-1.5 block text-sm font-medium text-slate-300">
					Identifiant
				</label>
				<input
					id="username"
					name="username"
					type="text"
					autocomplete="username"
					required
					class="form-field"
				/>
			</div>

			<div>
				<label for="password" class="mb-1.5 block text-sm font-medium text-slate-300">
					Mot de passe
				</label>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
					class="form-field"
				/>
			</div>

			<button type="submit" disabled={loading} class="btn-primary w-full">
				{#if loading}
					<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
						></path>
					</svg>
					Connexion...
				{:else}
					Se connecter
				{/if}
			</button>
		</form>
	</div>
</div>
