# Portfolio Implementations

This file records the technologies and PrimeVue components used by the portfolio, their documentation, and their current roles. The site uses Vue, Vite, and PrimeVue; a Node.js script exports PostgreSQL records and server-side screenshot files into static assets during the build.

## Foundation

| Technology | Documentation | Use in this project |
|---|---|---|
| Vue 3 | [Vue guide](https://vuejs.org/guide/introduction.html) | Reactive project listings, technology filters, preferences, and reusable UI components. |
| Vite | [Vite static deployment](https://vite.dev/guide/static-deploy) | Development server and production bundler. Static output in `dist/` is deployed to GitHub Pages and Nginx with `--base=./`. |
| PrimeVue | [PrimeVue installation](https://primevue.dev/installation/) | UI component library. The current package manifest declares PrimeVue 5. |
| Aura theme | [Styled theming](https://primevue.dev/theming/styled/) | Design-token preset configured with `darkModeSelector: '.theme-dark'`. Page CSS uses semantic color tokens; the user confirmed Light and Dark work. Matrix is selectable but its distinct palette remains pending. |
| PrimeIcons | [PrimeIcons](https://primevue.dev/icons/) | Navigation, view controls, theme icons, and external-link icons. |
| Vue I18n | [Vue I18n guide](https://vue-i18n.intlify.dev/guide/) | English/Spanish interface and accessibility translations, interpolated screenshot/completion descriptions, and page metadata. WD reuses English through wd: en. The user manually checked the translations. |
| Node.js 24 | [Node.js CLI](https://nodejs.org/docs/latest-v24.x/api/cli.html) | Executes the database/image exporter before the frontend build. `--env-file-if-exists=.env.local` loads local settings when the file exists. |
| node-postgres (`pg`) | [Connections](https://node-postgres.com/features/connecting) | Build dependency that reads PostgreSQL connection settings from `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD`. |

## Main content and navigation

| Component | Documentation | Use in this project |
|---|---|---|
| DataView | [Sorting example](https://primevue.dev/dataview/#sorting) | Project listing with grid/list selection. `App.vue` fetches the generated `data/projects.json` on mount and filters projects by all selected technologies. |
| Card | [Advanced example](https://primevue.dev/card/#advanced) | Both grid and list cards show screenshots, localized names/descriptions, version/date, technology tags, progress, and repository/demo actions. In list view, project-list-media groups the screenshot with progress below it; project-actions aligns the action row. |
| Toolbar | [Toolbar](https://primevue.dev/toolbar/) | Header containing the brand, section links, language selector, and theme selector. |
| Select | [Select](https://primevue.dev/select/) | Theme and language selection. Custom `#option` and `#value` slots display icons or flags for both the menu and selected value. |

Theme choices are Light, Dark, and Matrix. A watcher applies the matching `theme-*` class to `<html>` and saves the name under `zegirdor-portfolio-theme`. The `.capitalize-text` class only affects displayed capitalization.

The language selector uses PNG flags in src/assets/locale_flags/ and offers es, en, and WD Ghaster (wd). It changes Vue I18n's locale and persists normal en/es choices under zegirdor-portfolio-language. WD toggles locale-wd without overwriting the saved normal language. Project names/descriptions remain language-keyed JSONB; projectText() selects the active locale, falls back to English, and accepts plain strings.

The active page's controls and accessibility labels use locale messages: navigation/section labels, language/theme selectors, grid/list controls, technology filtering, loading, project actions, skill-summary labeling, and demo confirmation. Screenshot descriptions interpolate {name} with a translated unnamed-project fallback; completion labels interpolate {percentage}. Props bind expressions such as :label="i18n('projects.view_demo')". Fixed markup in trusted local messages uses v-html; project names/descriptions render as text.

## Localization and accessibility

- Locale messages are organized under the existing content sections plus accessibility, preferences, meta, and primevue in en.json/es.json. Language names and product/technology names remain recognizable proper names.
- The immediate language watcher updates Vue I18n, document.title, the description meta tag, and html.lang (wd maps to en because its messages are English). index.html intentionally retains its initial English values; the watcher replaces them after JavaScript runs.
- [PrimeVue locale configuration](https://primevue.dev/configuration/#locale) is accessed using usePrimeVue(). The watcher uses Object.assign(primevue.config.locale, ...) to refresh selectionMessage, emptySelectionMessage, and emptyMessage while preserving other settings.
- The selection message is stored as {count} in Vue I18n. Passing the literal string {0} as count preserves PrimeVue's placeholder, which the Select then replaces with the selection count. This synchronization runs on initialization and each selected-language change.
- WD uses the registered src/assets/fonts/wingding.woff font, keeps language-selector text readable, and preserves PrimeIcons. main.js aliases wd to en; there is no duplicate wd.json.
- The user has manually checked the interface translations. English text, title, and description embedded in public/images/default-project.svg are deferred as separate image work. The placeholder remains unchanged; translated img alt text does not translate words drawn inside the SVG.
- Rewording the existing translated loading-error message for the now-configured database remains a separate task.

## Project interactions

| Component | Documentation | Use in this project |
|---|---|---|
| Popover | [Popover](https://primevue.dev/popover/) | Asks for confirmation before opening a demo in a new tab. |
| Chip | [Chip](https://primevue.dev/chip/) | Technology labels in project cards and filter controls. |
| FocusTrap directive | [FocusTrap](https://primevue.dev/focustrap/) | Keeps keyboard focus within the demo-confirmation overlay. |
| Ripple directive | [Ripple](https://primevue.dev/ripple/) | Click feedback on selected buttons and controls. Enabled in PrimeVue configuration and registered as a directive. |
| Skeleton | [Skeleton](https://primevue.dev/skeleton/) | Placeholder cards while the browser fetches the static project JSON. |

## Summary, progress, and contact

| Component or feature | Documentation | Current use |
|---|---|---|
| MeterGroup | [MeterGroup](https://primevue.dev/metergroup/) | The About section currently supplies an empty array. The skills/proficiency display and its metric remain undecided. |
| ProgressSpinner | [ProgressSpinner](https://primevue.dev/progressspinner/) | Determinate completion display in both layouts, with larger percentage text. A null value hides it; exactly 100 uses the translated Complete label, and lower values use In progress. The accessible percentage announcement is also translated. |
| Contact form | [PrimeVue Forms](https://primevue.dev/forms/) | Deferred. The Contact section currently provides translated contact information and external links. A submission form would need a server endpoint or form service. |

## PostgreSQL schema and data

- [Schema SQL](database/schema/Zegirdor_Portfolio_database_schema_v0.5.sql) defines `Repository`, `Technology`, and the `Repository_Technology` junction table, their constraints, and indexes.
- [Population SQL](database/data/Zegirdor_Portfolio_data_population_v0.5.sql) records technology/proficiency values, the wedding project, and its technology associations.
- Repository names and descriptions use language-keyed JSONB. The technology catalog includes category and personal proficiency; it can later support a skills section separately from project tags.
- The SQL scripts are reference/setup files. The deployment workflow does not execute them. The exporter performs SELECT queries and publishes only repositories marked visible.

## Static export and screenshots

1. [scripts/export-projects.js](scripts/export-projects.js) queries visible repositories and joins their technology tags.
2. It copies each configured screenshot from the filesystem path stored in PostgreSQL into `public/images/project_screenshots/`, naming the copy from the project ID and file extension.
3. Each generated screenshot copy receives mode `0o644` so the deployed image can be read by Nginx.
4. It writes `public/data/projects.json` with localized content, links, technology names, version/date, authors, completion, and published image paths. Source filesystem paths and database credentials are omitted.
5. Vite packages the generated JSON and public images into `dist/`. In the browser, `projectImageUrl()` prefixes the Vite base path and falls back to `images/default-project.svg` when no screenshot is configured.

`npm run build` runs the exporter and then Vite. The workflow separates those operations so it can upload the exported assets before compiling the frontend. The runner needs traversal/read access to the source screenshots. A failed screenshot copy stops the exporter before it writes JSON.

Connection values are plain values in the ignored `.env.local` file for local use. GitHub Actions injects the same five `PG*` settings through repository secrets; secret values contain no assignment prefix or surrounding env-file quotes. Database secrets do not use the `VITE_` prefix.

Windows builds can read PostgreSQL over the LAN and use PORTFOLIO_SCREENSHOT_DIR=special_folder/project_screenshots for local image copies named by ID and the database path's extension. The override is resolved relative to the project root unless absolute; without it, the exporter uses database filesystem paths. The user confirmed local build/preview works. The corrected special_folder/ ignore rule excludes local sources; generated public/ copies are published. npm run dev serves already-exported public/ assets and does not rerun the exporter.

## Build and deployment

The [deployment workflow](.github/workflows/deploy.yml) runs on pushes to `main` and supports manual dispatch. Its jobs also check the branch so manually selecting another branch cannot deploy it.

- `build-on-homeserver` exports database data and screenshots, uploads `public/` as a same-run fallback snapshot, builds with Vite on Node.js 24, and uploads the deployment artifacts.
- `build-on-github` runs only after a failed home-server build. It downloads that snapshot and runs Vite without querying PostgreSQL or reading the server's SDB filesystem.
- Both deployment jobs wait for both build outcomes and select artifacts from the successful build. They deploy to GitHub Pages and the Nginx document root.
- The fallback requires the current-run exported-assets snapshot. A failed export cannot be recovered by the GitHub build, and an offline runner may remain queued rather than failing immediately.

[GitHub workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts) pass exported assets and built files between jobs.

The user previously confirmed local/home-server builds, screenshot HTTP 200, GitHub Pages data/images, and a committed/pushed release building successfully. Current interface translations were manually checked by the user. The GitHub fallback path has not been explicitly exercised in this session.
