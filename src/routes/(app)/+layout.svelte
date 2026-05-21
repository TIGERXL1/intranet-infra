<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	let menuOpen = $state(false);

	const displayName = $derived(data.user.displayName ?? data.user.username);
	const initials = $derived(
		displayName
			.split(' ')
			.map((w: string) => w[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);

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

	type NavHref = '/dashboard' | '/services' | '/status' | '/logs';
</script>

<div class="min-h-screen bg-slate-950 text-slate-100 lg:flex">
	{#if menuOpen}
		<button
			type="button"
			aria-label="Fermer le menu"
			class="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
			onclick={() => (menuOpen = false)}
		></button>
	{/if}

	<aside
		class="fixed inset-y-0 left-0 z-40 flex w-72 max-w-[86vw] flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:translate-x-0 {menuOpen
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<div class="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
			<div class="flex items-center gap-3">
				<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600">
					<svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
				</div>
				<div>
					<p class="font-semibold text-white">Intranet</p>
					<p class="text-xs text-slate-500">Infrastructure</p>
				</div>
			</div>
			<button
				type="button"
				class="icon-button lg:hidden"
				aria-label="Fermer le menu"
				onclick={() => (menuOpen = false)}
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18 18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<nav class="flex-1 space-y-1 px-3 py-4">
			{#each navLinks as link (link.href)}
				<a
					href={resolve(link.href as NavHref)}
					onclick={() => (menuOpen = false)}
					class="flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors
						{isActive(link.href)
						? 'bg-sky-500/15 text-sky-300'
						: 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}"
				>
					<svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={link.icon} />
					</svg>
					<span class="truncate">{link.label}</span>
				</a>
			{/each}

			{#if data.user.role === 'admin'}
				<a
					href={resolve('/admin')}
					onclick={() => (menuOpen = false)}
					class="flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors
						{isActive('/admin')
						? 'bg-sky-500/15 text-sky-300'
						: 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}"
				>
					<svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
						/>
					</svg>
					<span class="truncate">Administration</span>
				</a>
			{/if}
		</nav>

		<div class="border-t border-slate-800 p-4">
			<a
				href={resolve('/profile')}
				onclick={() => (menuOpen = false)}
				class="mb-3 flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-slate-800"
			>
				<div
					class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300"
				>
					{initials}
				</div>
				<div class="min-w-0">
					<p class="truncate text-sm font-medium text-slate-200">{displayName}</p>
					<p class="truncate text-xs text-slate-500">Voir le profil</p>
				</div>
			</a>
			<form method="post" action="/logout">
				<button
					type="submit"
					class="flex min-h-10 w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400"
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
			</form>
		</div>
	</aside>

	<main class="min-w-0 flex-1">
		<header
			class="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur lg:hidden"
		>
			<button
				type="button"
				class="icon-button"
				aria-label="Ouvrir le menu"
				onclick={() => (menuOpen = true)}
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>
			<span class="text-sm font-semibold text-white">Intranet</span>
			<a
				href={resolve('/profile')}
				class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300"
			>
				{initials}
			</a>
		</header>

		{@render children()}
	</main>
</div>
