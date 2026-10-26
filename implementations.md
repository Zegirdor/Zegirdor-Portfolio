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
| Vue I18n | [Vue I18n guide](https://vue-i18n.intlify.dev/guide/) | Composition API translations from `src/locales/en.json` and `src/locales/es.json`. Spanish is the initial default; both languages currently share one URL. |
| Node.js 24 | [Node.js CLI](https://nodejs.org/docs/latest-v24.x/api/cli.html) | Executes the database/image exporter before the frontend build. `--env-file-if-exists=.env.local` loads local settings when the file exists. |
| node-postgres (`pg`) | [Connections](https://node-postgres.com/features/connecting) | Build dependency that reads PostgreSQL connection settings from `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD`. |

## Main content and navigation

| Component | Documentation | Use in this project |
|---|---|---|
| DataView | [Sorting example](https://primevue.dev/dataview/#sorting) | Project listing with grid/list selection. `App.vue` fetches the generated `data/projects.json` on mount and filters projects by all selected technologies. |
| Card | [Advanced example](https://primevue.dev/card/#advanced) | Project containers. Grid cards show the screenshot, localized name/description, version/date, technology chips, completion indicator, and repository/demo actions. List cards currently show the image, name, description, technologies, and repository link. |
| Toolbar | [Toolbar](https://primevue.dev/toolbar/) | Header containing the brand, section links, language selector, and theme selector. |
| Select | [Select](https://primevue.dev/select/) | Theme and language selection. Custom `#option` and `#value` slots display icons or flags for both the menu and selected value. |

Theme choices are Light, Dark, and Matrix. A watcher applies the matching `theme-*` class to `<html>` and saves the name under `zegirdor-portfolio-theme`. The `.capitalize-text` class only affects displayed capitalization.

The language selector uses the PNG flags in `src/assets/locale_flags/`, changes Vue I18n's locale, and persists a validated `en`/`es` choice under `zegirdor-portfolio-language`. Project names and descriptions are language-keyed JSONB objects; `projectText()` uses the selected locale, then English as a fallback, and also accepts plain strings.

Project version/status labels, repository/demo actions, and the demo-confirmation text now use locale messages. Component props bind expressions, for example `:label="i18n('projects.view_demo')"`. Some interface and accessibility strings still need translation. Fixed markup in local locale messages uses `v-html`; project names and descriptions render as text.

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
| ProgressSpinner | [ProgressSpinner](https://primevue.dev/progressspinner/) | Determinate display of the saved completion percentage. The current condition includes every non-null percentage, including 100; the status label still needs to distinguish finished projects. |
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

Windows can query the database on the LAN, but it cannot directly read a Linux `/mnt/...` screenshot path. The full export is currently performed on the Linux home server. A local screenshot mapping or generated-data workflow for Windows remains a possible follow-up.

## Build and deployment

The [deployment workflow](.github/workflows/deploy.yml) runs on pushes to `main` and supports manual dispatch. Its jobs also check the branch so manually selecting another branch cannot deploy it.

- `build-on-homeserver` exports database data and screenshots, uploads `public/` as a same-run fallback snapshot, builds with Vite on Node.js 24, and uploads the deployment artifacts.
- `build-on-github` runs only after a failed home-server build. It downloads that snapshot and runs Vite without querying PostgreSQL or reading the server's SDB filesystem.
- Both deployment jobs wait for both build outcomes and select artifacts from the successful build. They deploy to GitHub Pages and the Nginx document root.
- The fallback requires the current-run exported-assets snapshot. A failed export cannot be recovered by the GitHub build, and an offline runner may remain queued rather than failing immediately.

[GitHub workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts) pass exported assets and built files between jobs.

The user confirmed a successful home-server build. Nginx has served the frontend and project JSON; the screenshot originally returned 403 because its deployed mode was 0660. The 0644 fix is implemented and was pushed. A successful live screenshot response after that fix, GitHub Pages rendering, and execution of the fallback path still require confirmation.
