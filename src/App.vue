<script setup>
import { usePrimeVue } from 'primevue/config'
import { usePreset } from '@primeuix/themes'
import Aura from "@primeuix/themes/aura"
import Matrix from "./themes/matrix.mjs"
import MatrixRain from './components/MatrixRain.vue'
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
import { useI18n } from 'vue-i18n'
import englishFlag from './assets/locale_flags/en_64x64.png'
import spanishFlag from './assets/locale_flags/es_64x64.png'
import ghasterFlag from './assets/locale_flags/wd_128x128.png'

const projects = ref([])
const loading = ref(true)
const loadError = ref(false)
const layout = ref('grid')
const selectedTechnologies = ref([])
const themes = [{theme: "light", icon: "pi pi-sun", preset: Aura}, {theme : "dark", icon : "pi pi-moon", preset: Aura}, {theme : "matrix", icon : "pi pi-code", preset: Matrix}]
const selectedTheme = ref(getInitialTheme())
const languageOptions = [
	{ code: 'es', name: 'Español', flag: spanishFlag },
	{ code: 'en', name: 'English', flag: englishFlag },
	{ code: 'wd', name: 'WD Ghaster', flag: ghasterFlag },
]
const selectedLanguage = ref(getInitialLanguage())
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

const { t: i18n, locale } = useI18n();
const baseUrl = import.meta.env.BASE_URL

const primevue = usePrimeVue()

function projectText(value) {
	if (typeof value === 'string') return value
	if (!value || typeof value !== 'object') return ''
	return value[locale.value] ?? value.en ?? ''
}

function projectImageUrl(project) {
	return project.screenshotUrl
		? baseUrl + project.screenshotUrl
		: baseUrl + 'images/default-project-image.svg'
}

function getLanguageOption(code) {
	return languageOptions.find((option) => option.code === code)
}

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
	const themeDefinition = themes.find((item) => item.theme === themeName)
	usePreset(themeDefinition.preset)
	localStorage.setItem('zegirdor-portfolio-theme', themeName)
},
{immediate: true} // Makes the watcher apply changes as soon as it's created so it applies the saved theme upon page load.
)

// Apply the saved language and keep Vue I18n and Local Storage in sync.
watch(selectedLanguage, (languageCode) => {
	locale.value = languageCode
	document.documentElement.lang = languageCode === 'wd' ? 'en' : languageCode
	document.title = i18n('meta.title')
	Object.assign(primevue.config.locale, {
		selectionMessage: i18n('primevue.selection_message', { count: '{0}' }),
		emptySelectionMessage: i18n('primevue.empty_selection'),
		emptyMessage: i18n('primevue.empty_options')
	})

	document.querySelector('meta[name="description"]')?.setAttribute('content', i18n('meta.description'))
	document.documentElement.classList.toggle('locale-wd', languageCode === 'wd')
	if (languageCode !== 'wd') {
		localStorage.setItem('zegirdor-portfolio-language', languageCode)
	}
},
{immediate: true}
)

function getInitialTheme() {
	const savedTheme = localStorage.getItem('zegirdor-portfolio-theme')
	return themes.some((themeData) => themeData.theme === savedTheme) ? savedTheme : themes[0].theme
}

function getInitialLanguage() {
	const savedLanguage = localStorage.getItem('zegirdor-portfolio-language')
	return languageOptions.some((option) => option.code === savedLanguage) ? savedLanguage : 'es'
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
		<MatrixRain v-if="selectedTheme === 'matrix'" />
		<header class="site-header">
			<Toolbar class="site-toolbar" :aria-label="i18n('accessibility.main_navigation')">
				<template #start>
					<a class="brand" href="#home" :aria-label="i18n('accessibility.home')" v-html="i18n('navigation.presentation')"></a>
				</template>
				<template #center>
					<nav class="main-nav" :aria-label="i18n('accessibility.main_sections')">
						<a href="#projects" v-html="i18n('navigation.projects')"></a>
						<a href="#about" v-html="i18n('navigation.about')"></a>
						<a href="#contact" v-html="i18n('navigation.contact')"></a>
					</nav>
				</template>
				<template #end>
					<div class="toolbar-preferences">
						<Select v-ripple v-model="selectedLanguage" :options="languageOptions" option-label="name" option-value="code" :aria-label="i18n('preferences.choose_language')" class="language-select">
							<template #option="{ option }">
								<span class="language-option">
									<img class="language-flag" :src="option.flag" alt="" aria-hidden="true" />
									<span>{{ option.name }}</span>
								</span>
							</template>
							<template #value="{ value }">
								<span v-if="getLanguageOption(value)" class="language-option">
									<img class="language-flag" :src="getLanguageOption(value).flag" alt="" aria-hidden="true" />
									<span>{{ getLanguageOption(value).name }}</span>
								</span>
							</template>
						</Select>

						<Select v-ripple v-model="selectedTheme" :options="themes" option-label="theme" option-value="theme" :aria-label="i18n('preferences.choose_theme')" class="capitalize-text">
							<template #option="{ option }">
								<i :class="option.icon" aria-hidden="true"></i>
								<span class="capitalize-text">&nbsp;{{ i18n(`themes.${option.theme}`) }}</span>
							</template>
							<template #value="{ value }">
								<span v-if="value">
									<i
										:class="themes.find((item) => item.theme === value)?.icon"
										aria-hidden="true"
									></i>
									{{ i18n(`themes.${value}`) }}
								</span>
							</template>
						</Select>
					</div>
				</template>
			</Toolbar>
		</header>

		<main id="home">
			<section class="hero section-wrap">
				<p class="eyebrow" v-html="i18n('hero_section.title_1')"></p>
				<h1 v-html="i18n('hero_section.title_2')"></h1>
				<p class="hero-copy" v-html="i18n('hero_section.title_3')"></p>
				<a class="hero-link" href="#projects">{{ i18n('hero_section.link_projects') }}&nbsp;<i class="pi pi-arrow-down"></i></a>
			</section>

			<section id="projects" class="projects-section section-wrap">
				<div class="section-heading">
					<div><p class="eyebrow" v-html="i18n('projects_section.title_1')"></p><h2 v-html="i18n('projects_section.title_2')"></h2></div>
					<div class="view-switch" :aria-label="i18n('projects_section.layout_label')">
						<Button v-ripple icon="pi pi-th-large" :outlined="layout !== 'grid'" :aria-label="i18n('projects_section.grid_view')" @click="layout = 'grid'" />
						<Button v-ripple icon="pi pi-list" :outlined="layout !== 'list'" :aria-label="i18n('projects_section.list_view')" @click="layout = 'list'" />
					</div>
				</div>

				<div v-if="technologyOptions.length" class="technology-filters" :aria-label="i18n('projects_section.filter_label')">
					<button
						v-for="technology in technologyOptions"
						:key="technology"
						class="technology-filter"
						:aria-pressed="selectedTechnologies.includes(technology)"
						@click="toggleTechnology(technology)"
					><Chip :label="technology" /></button>
					<Button v-if="selectedTechnologies.length" :label="i18n('projects_section.clear_filters')" text size="small" @click="selectedTechnologies = []" />
				</div>

				<div v-if="loading" class="project-grid" :aria-label="i18n('projects_section.loading')">
					<Card v-for="item in 3" :key="item" class="project-card">
						<template #content>
							<Skeleton class="project-skeleton-image" />
							<Skeleton width="45%" height="1.5rem" class="skeleton-line" />
							<Skeleton width="88%" class="skeleton-line" />
							<Skeleton width="68%" class="skeleton-line" />
						</template>
					</Card>
				</div>
				<p v-else-if="loadError" class="empty-state" role="status" v-html="i18n('projects_section.missing_database')"></p>

				<DataView v-else :value="visibleProjects" :layout="layout" class="project-listing">
					<template #grid="{ items }">
						<div class="project-grid">
							<Card v-for="project in items" :key="project.id" class="project-card">
								<template #header>
									<img class="project-image" :src="projectImageUrl(project)" :alt="i18n('projects.screenshot_alt', { name: projectText(project.name) || i18n('projects.unnamed_project') })" loading="lazy" />
								</template>
								<template #title>{{ projectText(project.name) }}</template>
								<template #subtitle>
									<span v-if="project.version">{{ i18n('projects.version') }}&nbsp;{{ project.version }}</span>
									<span v-if="project.version && project.projectDate">&nbsp;&mdash;&nbsp;</span>
									<span v-if="project.projectDate">{{ project.projectDate }}</span>
								</template>
								<template #content>
									<p class="project-description">{{ projectText(project.description) }}</p>
									<div class="project-tags"><Chip v-for="technology in project.technologies" :key="technology" :label="technology" /></div>
									<div v-if="project.completion != null" class="project-progress">
										<span>{{ i18n(project.completion === 100 ? 'projects.complete' : 'projects.in_progress') }}</span>
										<ProgressSpinner :value="project.completion" :pt="{ root: { 'aria-label': i18n('projects.completion_label', {percentage: project.completion}) } }" />
									</div>
								</template>
								<template #footer>
									<div class="project-actions">
										<a :href="project.repositoryUrl" target="_blank" rel="noopener noreferrer">{{ i18n('projects.repository') }}&nbsp;<i class="pi pi-arrow-up-right" /></a>
										<Button v-if="project.demoUrl" v-ripple :label="i18n('projects.view_demo')" icon="pi pi-external-link" text @click="askBeforeDemo($event, project.demoUrl)" />
									</div>
								</template>
							</Card>
						</div>
					</template>
					<template #list="{ items }">
						<div class="project-list">
							<Card v-for="project in items" :key="project.id" class="project-card project-card-list">
								<template #content>
									<div class="project-list-media">
										<img class="project-image" :src="projectImageUrl(project)" :alt="i18n('projects.screenshot_alt', { name: projectText(project.name) || i18n('projects.unnamed_project') })" loading="lazy" />
										<div v-if="project.completion != null" class="project-progress">
											<span>{{ i18n(project.completion === 100 ? 'projects.complete' : 'projects.in_progress') }}</span>
											<ProgressSpinner :value="project.completion" :pt="{ root: { 'aria-label': i18n('projects.completion_label', {percentage: project.completion}) } }" />
										</div>
									</div>
									
									<div class="project-list-copy">
										<h3>{{ projectText(project.name) }}</h3>
										<p>{{ projectText(project.description) }}</p>
										<div class="project-subtitle">
											<span v-if="project.version">{{ i18n('projects.version') }}&nbsp;{{ project.version }}</span>
											&nbsp;&mdash;&nbsp;
											<span v-if="project.projectDate">{{ project.projectDate }}</span>
										</div>
										<div class="project-tags"><Chip v-for="technology in project.technologies" :key="technology" :label="technology" /></div>
										<div class="project-actions">
											<a :href="project.repositoryUrl" target="_blank" rel="noopener noreferrer">{{ i18n('projects.repository') }}&nbsp;<i class="pi pi-arrow-up-right"></i></a>
											<Button v-if="project.demoUrl" v-ripple :label="i18n('projects.view_demo')" icon="pi pi-external-link" text @click="askBeforeDemo($event, project.demoUrl)" />
										</div>
									</div>
								</template>
							</Card>
						</div>
					</template>
					<template #empty><p class="empty-state" v-html="i18n('projects_section.missing_projects')"></p></template>
				</DataView>
			</section>

			<section id="about" class="about-section section-wrap">
				<div><p class="eyebrow" v-html="i18n('about_section.title_1')"></p><h2 v-html="i18n('about_section.title_2')"></h2></div>
				<div class="about-copy">
					<p v-html="i18n('about_section.info_1')"></p>
					<MeterGroup :value="[]" :aria-label="i18n('about_section.skills_summary')" />
				</div>
			</section>

			<section id="contact" class="contact-section section-wrap">
				<div><p class="eyebrow" v-html="i18n('contact_section.title_1')"></p><h2 v-html="i18n('contact_section.info_1')"></h2></div>
				<p v-html="i18n('contact_section.info_2')"></p>
			</section>
		</main>

		<footer class="site-footer section-wrap">
			<span>© {{ new Date().getFullYear() }} ZegirdorDev</span>
			<span v-html="i18n('footer.title_2')"></span>
		</footer>

		<Popover ref="demoPopover">
			<div v-focustrap class="demo-confirmation">
				<p v-html="i18n('projects.open_full_tab_dialogue')"></p>
				<a :href="selectedDemoUrl" target="_blank" rel="noopener noreferrer" @click="demoPopover.hide()">{{ i18n('projects.continue_to_demo') }}&nbsp;<i class="pi pi-arrow-up-right" /></a>
			</div>
		</Popover>
	</div>
</template>
