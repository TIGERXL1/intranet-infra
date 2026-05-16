<script lang="ts">
	const categories = ['Tous', 'Infrastructure', 'Réseau', 'Annuaire', 'Cloud', 'Supervision'];

	const services = [
		{
			id: 'proxmox',
			name: 'Proxmox VE',
			description: 'Hyperviseur de la maquette, hôte des VMs et conteneurs du projet.',
			url: 'https://192.168.1.33:8006',
			category: 'Infrastructure',
			status: 'Disponible',
			external: true
		},
		{
			id: 'opnsense',
			name: 'OPNsense',
			description: 'Routeur, pare-feu et passerelle NAT entre le réseau amont et le LAN projet.',
			url: 'https://192.168.10.1',
			category: 'Réseau',
			status: 'Disponible',
			external: true
		},
		{
			id: 'srv-dns',
			name: 'SRV-DNS',
			description: 'Serveur Bind9 pour la zone interne entreprise.local et les résolutions inverses.',
			url: '/status',
			category: 'Réseau',
			status: 'Monitoré',
			external: false
		},
		{
			id: 'srv-openldap',
			name: 'SRV-OpenLDAP',
			description: 'Annuaire OpenLDAP centralisé pour les utilisateurs et groupes du projet.',
			url: '/status',
			category: 'Annuaire',
			status: 'Monitoré',
			external: false
		},
		{
			id: 'srv-nextcloud',
			name: 'SRV-Nextcloud',
			description: 'Cloud privé Nextcloud publié en HTTPS et relié à OpenLDAP.',
			url: 'https://192.168.10.20',
			category: 'Cloud',
			status: 'Disponible',
			external: true
		},
		{
			id: 'srv-intranet',
			name: 'SRV-Intranet',
			description: 'Portail intranet, supervision applicative, audit et administration locale.',
			url: '/dashboard',
			category: 'Supervision',
			status: 'Disponible',
			external: false
		}
	];

	let activeCategory = $state('Tous');

	const filtered = $derived(
		activeCategory === 'Tous' ? services : services.filter((s) => s.category === activeCategory)
	);
</script>

<div class="p-8">
	<header class="mb-8">
		<h1 class="text-2xl font-bold text-white">Services</h1>
		<p class="mt-1 text-sm text-slate-400">Accédez aux composants réels de l'infrastructure</p>
	</header>

	<div class="mb-6 flex flex-wrap gap-2">
		{#each categories as cat}
			<button
				onclick={() => (activeCategory = cat)}
				class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
					{activeCategory === cat
					? 'bg-blue-600 text-white'
					: 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}"
			>
				{cat}
			</button>
		{/each}
	</div>

	<div class="grid grid-cols-2 gap-4 xl:grid-cols-3">
		{#each filtered as service}
			<div
				class="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-slate-700"
			>
				<div class="mb-4 flex items-start justify-between gap-3">
					<div class="min-w-0">
						<h3 class="truncate font-semibold text-white">{service.name}</h3>
						<span class="text-xs text-slate-500">{service.category}</span>
					</div>
					<span
						class="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-green-400/10 px-2.5 py-1 text-xs font-medium text-green-400"
					>
						<span class="h-1.5 w-1.5 rounded-full bg-green-400"></span>
						{service.status}
					</span>
				</div>

				<p class="mb-5 flex-1 text-sm text-slate-400">{service.description}</p>

				<a
					href={service.url}
					target={service.external ? '_blank' : undefined}
					rel={service.external ? 'noreferrer' : undefined}
					class="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-blue-500 hover:text-blue-400"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>
					Accéder
				</a>
			</div>
		{/each}
	</div>
</div>
