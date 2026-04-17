<script lang="ts">
	const categories = ['Tous', 'Infrastructure', 'Réseau', 'Productivité', 'Monitoring', 'Développement'];

	const services = [
		{
			id: 'proxmox',
			name: 'Proxmox VE',
			description: 'Plateforme de virtualisation open-source pour la gestion des VMs et conteneurs LXC.',
			url: '#',
			category: 'Infrastructure',
			online: true
		},
		{
			id: 'opnsense',
			name: 'OPNsense',
			description: 'Pare-feu et routeur réseau avec interface web de configuration avancée.',
			url: '#',
			category: 'Réseau',
			online: true
		},
		{
			id: 'nextcloud',
			name: 'Nextcloud',
			description: 'Plateforme de stockage et de partage de fichiers auto-hébergée.',
			url: '#',
			category: 'Productivité',
			online: true
		},
		{
			id: 'grafana',
			name: 'Grafana',
			description: 'Tableaux de bord de visualisation pour les métriques et la supervision.',
			url: '#',
			category: 'Monitoring',
			online: false
		},
		{
			id: 'portainer',
			name: 'Portainer',
			description: 'Interface de gestion des conteneurs Docker et Kubernetes.',
			url: '#',
			category: 'Infrastructure',
			online: true
		},
		{
			id: 'gitlab',
			name: 'GitLab',
			description: 'Dépôts Git, gestion de projets et pipelines CI/CD intégrés.',
			url: '#',
			category: 'Développement',
			online: false
		},
		{
			id: 'prometheus',
			name: 'Prometheus',
			description: 'Système de collecte et d\'alerting pour les métriques d\'infrastructure.',
			url: '#',
			category: 'Monitoring',
			online: true
		},
		{
			id: 'vaultwarden',
			name: 'Vaultwarden',
			description: 'Gestionnaire de mots de passe compatible Bitwarden auto-hébergé.',
			url: '#',
			category: 'Productivité',
			online: true
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
		<p class="mt-1 text-sm text-slate-400">Accédez aux services de l'infrastructure</p>
	</header>

	<!-- Filtres -->
	<div class="mb-6 flex gap-2 flex-wrap">
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

	<!-- Grid -->
	<div class="grid grid-cols-2 gap-4 xl:grid-cols-3">
		{#each filtered as service}
			<div
				class="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-slate-700"
			>
				<div class="mb-4 flex items-start justify-between">
					<div>
						<h3 class="font-semibold text-white">{service.name}</h3>
						<span class="text-xs text-slate-500">{service.category}</span>
					</div>
					<span
						class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
							{service.online
							? 'bg-green-400/10 text-green-400'
							: 'bg-red-400/10 text-red-400'}"
					>
						<span class="h-1.5 w-1.5 rounded-full {service.online ? 'bg-green-400' : 'bg-red-400'}"
						></span>
						{service.online ? 'En ligne' : 'Hors ligne'}
					</span>
				</div>

				<p class="mb-5 flex-1 text-sm text-slate-400">{service.description}</p>

				<a
					href={service.url}
					class="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-blue-500 hover:text-blue-400
						{!service.online ? 'pointer-events-none opacity-40' : ''}"
					aria-disabled={!service.online}
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
