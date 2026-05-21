<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const categories = ['Tous', 'Infrastructure', 'Réseau', 'Annuaire', 'Cloud', 'Supervision'];

	const services = [
		{
			id: 'proxmox',
			name: 'Proxmox VE',
			description: 'Hyperviseur de la maquette, hôte des VMs et conteneurs du projet.',
			url: 'https://192.168.1.33:8006',
			category: 'Infrastructure',
			status: 'Disponible',
			external: true,
			icon: 'M4 5h16v14H4V5zm4 4h3v3H8V9zm5 0h3v3h-3V9zm-5 5h3v2H8v-2zm5 0h3v2h-3v-2z'
		},
		{
			id: 'opnsense',
			name: 'OPNsense',
			description: 'Routeur, pare-feu et passerelle NAT entre le réseau amont et le LAN projet.',
			url: 'https://192.168.10.1',
			category: 'Réseau',
			status: 'Disponible',
			external: true,
			icon: 'M12 3l8 4v5c0 5-3.4 8.7-8 9-4.6-.3-8-4-8-9V7l8-4z'
		},
		{
			id: 'srv-dns',
			name: 'SRV-DNS',
			description:
				'Serveur Bind9 pour la zone interne entreprise.local et les résolutions inverses.',
			url: '/status',
			category: 'Réseau',
			status: 'Monitoré',
			external: false,
			icon: 'M4 7h16M4 12h16M4 17h16M8 4v16m8-16v16'
		},
		{
			id: 'srv-openldap',
			name: 'SRV-OpenLDAP',
			description: 'Annuaire OpenLDAP centralisé pour les utilisateurs et groupes du projet.',
			url: '/status',
			category: 'Annuaire',
			status: 'Monitoré',
			external: false,
			icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 1116 0'
		},
		{
			id: 'srv-nextcloud',
			name: 'SRV-Nextcloud',
			description: 'Cloud privé Nextcloud publié en HTTPS et relié à OpenLDAP.',
			url: 'https://192.168.10.20',
			category: 'Cloud',
			status: 'Disponible',
			external: true,
			icon: 'M3 15a4 4 0 014-4h1.26A5.5 5.5 0 0119 12.5 3.5 3.5 0 1119 19H7a4 4 0 01-4-4z'
		},
		{
			id: 'srv-intranet',
			name: 'SRV-Intranet',
			description: 'Portail intranet, supervision applicative, audit et administration locale.',
			url: '/dashboard',
			category: 'Supervision',
			status: 'Disponible',
			external: false,
			icon: 'M4 6h16v12H4V6zm3 4h4m-4 4h7m3-4h1m-1 4h1'
		}
	];

	let activeCategory = $state('Tous');

	const filtered = $derived(
		activeCategory === 'Tous' ? services : services.filter((s) => s.category === activeCategory)
	);

	type InternalServiceUrl = '/status' | '/dashboard';

	function openService(service: { url: string; external: boolean }) {
		if (service.external) {
			const opened = window.open(service.url, '_blank', 'noreferrer');
			if (opened) opened.opener = null;
			return;
		}

		void goto(resolve(service.url as InternalServiceUrl));
	}
</script>

<div class="page-shell">
	<header class="page-header">
		<div>
			<h1 class="page-title">Services</h1>
			<p class="page-subtitle">Accédez aux composants réels de l'infrastructure</p>
		</div>
	</header>

	<div class="mb-6 flex gap-2 overflow-x-auto pb-1">
		{#each categories as cat (cat)}
			<button
				type="button"
				onclick={() => (activeCategory = cat)}
				class="shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors
					{activeCategory === cat
					? 'bg-sky-600 text-white'
					: 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}"
			>
				{cat}
			</button>
		{/each}
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each filtered as service (service.id)}
			<div class="panel panel-hover flex min-h-64 flex-col p-5">
				<div class="mb-4 flex items-start justify-between gap-3">
					<div class="flex min-w-0 items-start gap-3">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-300"
						>
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.7"
									d={service.icon}
								/>
							</svg>
						</div>
						<div class="min-w-0">
							<h3 class="truncate font-semibold text-white">{service.name}</h3>
							<span class="text-xs text-slate-500">{service.category}</span>
						</div>
					</div>
					<span class="status-pill shrink-0 bg-emerald-400/10 text-emerald-300">
						<span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
						{service.status}
					</span>
				</div>

				<p class="mb-5 flex-1 text-sm leading-6 text-slate-400">{service.description}</p>
				<button type="button" onclick={() => openService(service)} class="btn-secondary w-full">
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>
					Accéder
				</button>
			</div>
		{/each}
	</div>
</div>
