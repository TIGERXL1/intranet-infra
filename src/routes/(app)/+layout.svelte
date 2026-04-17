<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { children } = $props();
	let username = $state('');

	onMount(() => {
		const raw = sessionStorage.getItem('user');
		if (!raw) {
			goto('/login');
			return;
		}
		try {
			const user = JSON.parse(raw);
			username = user.name ?? user.username ?? 'Utilisateur';
		} catch {
			goto('/login');
		}
	});

	function logout() {
		sessionStorage.removeItem('user');
		goto('/login');
	}

	const navLinks = [
		{
			href: '/dashboard',
			label: 'Tableau de bord',
			icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
		},
		{
			href: '/services',
			label: 'Services',
			icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
		},
		{
			href: '/status',
			label: 'État des services',
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
		},
		{
			href: '/logs',
			label: 'Journaux',
			icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
		}
	];

	const isActive = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(href + '/');
</script>

<div class="flex h-screen bg-slate-950 text-slate-100">
	<!-- Sidebar -->
	<aside class="flex w-64 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-900">
		<!-- Brand -->
		<div class="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
				<svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
					/>
				</svg>
			</div>
			<span class="font-semibold text-white">Intranet</span>
		</div>

		<!-- Nav -->
		<nav class="flex-1 space-y-1 px-3 py-4">
			{#each navLinks as link}
				<a
					href={link.href}
					class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
						{isActive(link.href)
						? 'bg-blue-600/20 text-blue-400'
						: 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}"
				>
					<svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={link.icon} />
					</svg>
					{link.label}
				</a>
			{/each}
		</nav>

		<!-- User / Logout -->
		<div class="border-t border-slate-800 p-4">
			<a
				href="/profile"
				class="mb-3 flex items-center gap-3 rounded-lg px-1 py-1 transition-colors hover:bg-slate-800"
			>
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300"
				>
					{username ? username[0].toUpperCase() : '?'}
				</div>
				<div class="min-w-0">
					<p class="truncate text-sm font-medium text-slate-200">{username || '...'}</p>
					<p class="text-xs text-slate-500">Voir le profil</p>
				</div>
			</a>
			<button
				onclick={logout}
				class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
					/>
				</svg>
				Se déconnecter
			</button>
		</div>
	</aside>

	<!-- Main content -->
	<main class="flex-1 overflow-y-auto">
		{@render children()}
	</main>
</div>
