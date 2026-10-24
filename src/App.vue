<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Chip from 'primevue/chip'
import DataView from 'primevue/dataview'
import MeterGroup from 'primevue/metergroup'
import Popover from 'primevue/popover'
import ProgressSpinner from 'primevue/progressspinner'
import Skeleton from 'primevue/skeleton'
import Toolbar from 'primevue/toolbar'
import Select from 'primevue/select'

const projects = ref([])
const loading = ref(true)
const loadError = ref(false)
const layout = ref('grid')
const selectedTechnologies = ref([])
const themes = [{theme: "light", icon: "pi pi-sun"}, {theme : "dark", icon : "pi pi-moon"}, {theme : "matrix", icon : "pi pi-code"}]
const selectedTheme = ref(getInitialTheme())
const demoPopover = ref()
const selectedDemoUrl = ref('')

const technologyOptions = computed(() =>
    [...new Set(projects.value.flatMap((project) => project.technologies ?? []))].sort(),
)

const visibleProjects = computed(() => {
  if (selectedTechnologies.value.length === 0) return projects.value
	return projects.value.filter((project) =>
		selectedTechnologies.value.every((technology) =>
			(project.technologies ?? []).includes(technology),
		),
	)
})

function toggleTechnology(technology) {
	selectedTechnologies.value = selectedTechnologies.value.includes(technology)
	? selectedTechnologies.value.filter((item) => item !== technology)
	: [...selectedTechnologies.value, technology]
}

function askBeforeDemo(event, url) {
	selectedDemoUrl.value = url
	demoPopover.value.toggle(event)
}

// Apply the initial theme and keep the page class and Local Storage in sync.
watch(selectedTheme, (themeName) => {
	const root = document.documentElement
	// const themeClasses = themes.map((name) => `theme-${name}`)
	root.classList.remove(...themes.map((themeData) => `theme-${themeData.theme}`))
	root.classList.add(`theme-${themeName}`)
	localStorage.setItem('zegirdor-portfolio-theme', themeName)
},
{immediate: true} // Makes the watcher apply changes as soon as it's created so it applies the saved theme upon page load.
)

function getInitialTheme() {
	const savedTheme = localStorage.getItem('zegirdor-portfolio-theme')
	return themes.some((themeData) => themeData.theme === savedTheme) ? savedTheme : themes[0].theme
}

onMounted(async () => {
	try {
		const response = await fetch(`${import.meta.env.BASE_URL}data/projects.json`)
		if (!response.ok) throw new Error('Project data is not available yet.')
		projects.value = await response.json()
	} catch {
		loadError.value = true
	} finally {
		loading.value = false
	}
})
</script>

<template>
	<div class="site-shell">
		<header class="site-header">
			<Toolbar class="site-toolbar" aria-label="Main navigation">
				<template #start>
					<a class="brand" href="#home" aria-label="ZegirdorDev home">Zegirdor<span>Dev</span></a>
				</template>
				<template #center>
					<nav class="main-nav" aria-label="Main sections">
						<a href="#projects">Projects</a>
						<a href="#about">About</a>
						<a href="#contact">Contact</a>
					</nav>
				</template>
				<template #end>
					<Select v-ripple v-model="selectedTheme" :options="themes" option-label="theme" option-value="theme" aria-label="Choose theme" class="capitalize-text">
						<template #option="{ option }">
							<i :class="option.icon" aria-hidden="true"></i>
							<span class="capitalize-text">&nbsp;{{ option.theme }}</span>
						</template>
						<template #value="{ value }">
							<span v-if="value">
								<i
									:class="themes.find((item) => item.theme === value)?.icon"
									aria-hidden="true"
								></i>
								{{ value }}
							</span>
						</template>
					</Select>
				</template>
			</Toolbar>
		</header>

		<main id="home">
			<section class="hero section-wrap">
				<p class="eyebrow">Developer portfolio</p>
				<h1>Building useful things<br /><span>with thoughtful technology.</span></h1>
				<p class="hero-copy">A home for selected projects, experiments, and the tools behind them.</p>
				<a class="hero-link" href="#projects">Explore projects <i class="pi pi-arrow-down" /></a>
			</section>

			<section id="projects" class="projects-section section-wrap">
				<div class="section-heading">
					<div><p class="eyebrow">Selected work</p><h2>Projects</h2></div>
					<div class="view-switch" aria-label="Project layout">
						<Button v-ripple icon="pi pi-th-large" :outlined="layout !== 'grid'" aria-label="Grid view" @click="layout = 'grid'" />
						<Button v-ripple icon="pi pi-list" :outlined="layout !== 'list'" aria-label="List view" @click="layout = 'list'" />
					</div>
				</div>

				<div v-if="technologyOptions.length" class="technology-filters" aria-label="Filter projects by technology">
					<button
						v-for="technology in technologyOptions"
						:key="technology"
						class="technology-filter"
						:aria-pressed="selectedTechnologies.includes(technology)"
						@click="toggleTechnology(technology)"
					><Chip :label="technology" /></button>
					<Button v-if="selectedTechnologies.length" label="Clear filters" text size="small" @click="selectedTechnologies = []" />
				</div>

				<div v-if="loading" class="project-grid" aria-label="Loading projects">
					<Card v-for="item in 3" :key="item" class="project-card">
						<template #content>
							<Skeleton class="project-skeleton-image" />
							<Skeleton width="45%" height="1.5rem" class="skeleton-line" />
							<Skeleton width="88%" class="skeleton-line" />
							<Skeleton width="68%" class="skeleton-line" />
						</template>
					</Card>
				</div>
				<p v-else-if="loadError" class="empty-state" role="status">
					Project data will appear here after the database build step is configured.
				</p>

				<DataView v-else :value="visibleProjects" :layout="layout" class="project-listing">
					<template #grid="{ items }">
						<div class="project-grid">
							<Card v-for="project in items" :key="project.id" class="project-card">
								<template #header>
									<img class="project-image" :src="project.screenshotUrl || '/images/default-project.svg'" :alt="project.screenshotAlt || `${project.name} screenshot`" loading="lazy" />
								</template>
								<template #title>{{ project.name }}</template>
								<template #subtitle>
									<span v-if="project.version">Version {{ project.version }}</span>
									<span v-if="project.projectDate">{{ project.projectDate }}</span>
								</template>
								<template #content>
									<p class="project-description">{{ project.description }}</p>
									<div class="project-tags"><Chip v-for="technology in project.technologies" :key="technology" :label="technology" /></div>
									<div v-if="project.completion != null" class="project-progress">
										<span>In progress</span>
										<ProgressSpinner :value="project.completion" :pt="{ root: { 'aria-label': `${project.completion}% complete` } }" />
									</div>
								</template>
								<template #footer>
									<div class="project-actions">
										<a :href="project.repositoryUrl" target="_blank" rel="noopener noreferrer">Repository <i class="pi pi-arrow-up-right" /></a>
										<Button v-if="project.demoUrl" v-ripple label="View demo" icon="pi pi-external-link" text @click="askBeforeDemo($event, project.demoUrl)" />
									</div>
								</template>
							</Card>
						</div>
					</template>
					<template #list="{ items }">
						<div class="project-list">
							<Card v-for="project in items" :key="project.id" class="project-card project-card-list">
								<template #content>
									<img class="project-image" :src="project.screenshotUrl || '/images/default-project.svg'" :alt="project.screenshotAlt || `${project.name} screenshot`" loading="lazy" />
									<div class="project-list-copy">
										<h3>{{ project.name }}</h3><p>{{ project.description }}</p>
										<div class="project-tags"><Chip v-for="technology in project.technologies" :key="technology" :label="technology" /></div>
										<a :href="project.repositoryUrl" target="_blank" rel="noopener noreferrer">Repository <i class="pi pi-arrow-up-right" /></a>
									</div>
								</template>
							</Card>
						</div>
					</template>
					<template #empty><p class="empty-state">No visible projects yet. Add entries to PostgreSQL and rebuild to publish them.</p></template>
				</DataView>
			</section>

			<section id="about" class="about-section section-wrap">
				<div><p class="eyebrow">A little about me</p><h2>Curiosity, craft, and continuous learning.</h2></div>
				<div class="about-copy">
					<p>This section is ready for your bio and the skills you want to highlight.</p>
					<MeterGroup :value="[]" aria-label="Skills summary placeholder" />
				</div>
			</section>

			<section id="contact" class="contact-section section-wrap">
				<div><p class="eyebrow">Get in touch</p><h2>I'm looking for a job</h2></div>
				<p>The contact form and its secure submission endpoint can be added in a later step.</p>
			</section>
		</main>

		<footer class="site-footer section-wrap">
			<span>© {{ new Date().getFullYear() }} ZegirdorDev</span>
			<span>Built with Vue, Vite, and PrimeVue</span>
		</footer>

		<Popover ref="demoPopover">
			<div v-focustrap class="demo-confirmation">
				<p>Open the full project demo in a new tab?</p>
				<a :href="selectedDemoUrl" target="_blank" rel="noopener noreferrer" @click="demoPopover.hide()">Continue to demo <i class="pi pi-arrow-up-right" /></a>
			</div>
		</Popover>
	</div>
</template>
