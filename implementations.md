# Portfolio Implementations

This file records the technologies and PrimeVue components used by the portfolio, their documentation, and their current roles. The site uses Vue, Vite, and PrimeVue; a Node.js script exports PostgreSQL records and server-side screenshot files into static assets during the build.

## Foundation

| Technology | Documentation | Use in this project |
|---|---|---|
| Vue 3 | [Vue guide](https://vuejs.org/guide/introduction.html) | Reactive project listings, database-derived skill groups, technology filters, preferences, and reusable UI components. |
| Vite | [Vite static deployment](https://vite.dev/guide/static-deploy) | Development server and production bundler. Static output in `dist/` is deployed to GitHub Pages and Nginx with `--base=./`. |
| PrimeVue | [PrimeVue installation](https://primevue.dev/installation/) | UI component library. The current package manifest declares PrimeVue 5. |
| Aura and Matrix presets | [Styled theming](https://primevue.dev/theming/styled/) | Aura supplies Light/Dark; src/themes/matrix.mjs extends it for Matrix. Each theme option contains its preset, and the watcher selects it with usePreset() while applying the matching theme-* class. |
| PrimeIcons | [PrimeIcons](https://primevue.dev/icons/) | Navigation, view controls, theme icons, and external-link icons. |
| Vue I18n | [Vue I18n guide](https://vue-i18n.intlify.dev/guide/) | English/Spanish interface and accessibility translations, interpolated screenshot/completion descriptions, and page metadata. WD reuses English through wd: en. The user manually checked the translations. |
| Node.js 24 | [Node.js CLI](https://nodejs.org/docs/latest-v24.x/api/cli.html) | Executes the database/image exporter before the frontend build. `--env-file-if-exists=.env.local` loads local settings when the file exists. |
| node-postgres (`pg`) | [Connections](https://node-postgres.com/features/connecting) | Build dependency that reads PostgreSQL connection settings from `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD`. |

## Main content and navigation

| Component | Documentation | Use in this project |
|---|---|---|
| DataView | [Sorting example](https://primevue.dev/dataview/#sorting) | Project listing with grid/list selection. `App.vue` fetches the generated `data/projects.json` on mount and filters projects by all selected technologies. |
| Card | [Advanced example](https://primevue.dev/card/#advanced) | Both grid and list cards show screenshots, localized names/descriptions, version/date, technology tags, progress, and repository/demo actions. In list view, project-list-media groups the screenshot with progress below it; project-actions aligns the action row. |
| Toolbar | [Toolbar](https://primevue.dev/toolbar/) | Responsive brand/navigation/preferences header. Up to 1110px, a translated toggle reveals navigation underneath the centered brand; preference selectors stay visible. |
| Select | [Select](https://primevue.dev/select/) | Theme and language selection with custom option/value slots. Mobile selected values show only icons/flags; option labels remain visible in the dropdown. Desktop values retain their text. |

Theme choices are Light, Dark, and Matrix. Each option stores theme, icon, and preset. The immediate watcher finds the selected definition, applies its theme-* class, calls usePreset(themeDefinition.preset), and saves the name under zegirdor-portfolio-theme. Light/Dark share Aura, with .theme-dark controlling Aura's scheme; Matrix supplies its own palette. Adding another custom theme requires its definition/import and styles rather than another theme-specific condition. The .capitalize-text class only affects displayed capitalization.

The language selector uses PNG flags in src/assets/locale_flags/ and offers es, en, and WD Ghaster (wd). It changes Vue I18n's locale and persists normal en/es choices under zegirdor-portfolio-language. WD toggles locale-wd without overwriting the saved normal language. Project names/descriptions remain language-keyed JSONB; projectText() selects the active locale, falls back to English, and accepts plain strings.

The dedicated #skills section has a navigation link, localized heading/copy/disclaimer, and Chips showing each technology name and a translated proficiency label. The proficiency messages live at the root of en.json/es.json; the lookup uses proficiency.${skill.proficiency.replaceAll(' ', '_')}. Category headings use root-level skill_categories messages with te() aliased to hasTranslation and a skill_categories.missing fallback. skillsLoading/skillsLoadError and an empty-array check now select translated status/error/empty messages before the populated grid; the owner observed loading and verified category translations.

The active page's controls and accessibility labels use locale messages: navigation/section labels, language/theme selectors, grid/list controls, technology filtering, loading, project actions, Skills navigation/proficiency labels, and demo confirmation. Screenshot descriptions interpolate {name} with a translated unnamed-project fallback; completion labels interpolate {percentage}. Props bind expressions such as :label="i18n('projects.view_demo')". Fixed markup in trusted local messages uses v-html; project names/descriptions render as text.

## Responsive header and hero portrait

- mobileMenuOpen is a ref controlling the Toolbar's mobile-menu-open class, menu icon, translated open/close label, and aria-expanded. aria-controls identifies header-navigation; the language/theme selectors are outside the collapsible content.
- Mobile CSS up to 1110px uses .site-toolbar.p-toolbar to override PrimeVue's default flex display. Named grid areas place the toggle/brand/preferences in the top row and navigation across the bottom row. The start wrapper uses display: contents so the toggle and brand participate in that grid.
- Only the selected-value text has .preference-label and is hidden on mobile, along with Select chevrons. Both option slots retain text; WD retains its currentColor mask. The selected theme's nonbreaking space is inside .preference-label so it disappears with the text.
- site-toolbar-matrix-theme is applied conditionally for Matrix. At 1418px and above, the current width cap is 1400px; from 1110px through 1417px, wrapping is disabled. The owner adjusted and accepted these desktop rules.
- App.vue imports src/assets/images/profile.png and binds :src to profilePicture, with translated hero_section.profile_pic_alt. The hero uses a 2fr/1fr layout and stacks below 801px. The photo wrapper uses align-self: center, height: auto, aspect-ratio: 1 / 1, rounded corners, and clipping; object-fit: cover fills it. Existing custom mobile overrides remain. The owner accepted the result across themes.

## Localization and accessibility

- Locale messages are organized under the existing content sections plus accessibility, preferences, meta, and primevue in en.json/es.json. Language names and product/technology names remain recognizable proper names.
- The immediate language watcher updates Vue I18n, document.title, the description meta tag, and html.lang (wd maps to en because its messages are English). index.html intentionally retains its initial English values; the watcher replaces them after JavaScript runs.
- [PrimeVue locale configuration](https://primevue.dev/configuration/#locale) is accessed using usePrimeVue(). The watcher uses Object.assign(primevue.config.locale, ...) to refresh selectionMessage, emptySelectionMessage, and emptyMessage while preserving other settings.
- The selection message is stored as {count} in Vue I18n. Passing the literal string {0} as count preserves PrimeVue's placeholder, which the Select then replaces with the selection count. This synchronization runs on initialization and each selected-language change.
- src/font.css centralizes @font-face declarations and is imported before style.css in main.js. WD uses assets/fonts/wingding.woff, applies font-size: small to reduce wrapping, keeps language-selector text readable, and preserves PrimeIcons. main.js aliases wd to en; there is no duplicate wd.json.
- The user manually checked the interface translations. The old English-text placeholder was replaced with the language-neutral default-project-image.svg; the frontend uses its translated img alt text. The static index.html English defaults remain intentionally unchanged.
- The project-loading error messages now describe unavailable project data, matching the browser's static JSON fetch rather than attributing the failure to PostgreSQL.

## Matrix theme and animated background

- [src/themes/matrix.mjs](src/themes/matrix.mjs) defines the preset using definePreset(Aura, ...). Chosen accent is #1EFF5A, background/contrast is #040805, and foreground is #00FF40. Shared tokens cover content, form fields, overlays, and dropdown option states; component tokens customize Chips and primary text-button hover/pressed backgrounds.
- Matrix content.borderColor also corrected the former empty MeterGroup track. That placeholder/import have since been removed in favor of the standalone Skills section.
- [src/font.css](src/font.css) registers MatrixTerminal from assets/fonts/TerminalVision.otf as OpenType with font-display: swap. :root.theme-matrix applies the terminal stack; .technology-filter uses font-family: inherit so native filter buttons and their Chips follow it.
- [src/components/MatrixRain.vue](src/components/MatrixRain.vue) renders an aria-hidden fixed canvas. App.vue mounts it inside .site-shell before the header only when selectedTheme === 'matrix'. The component has resize listeners and an animation-frame cleanup callback for unmounting.
- The rain uses randomized Katakana, Latin letters, and digits with 16px monospace glyphs, a translucent black fade, and green #0F0 drawing. requestAnimationFrame is timestamp-throttled to a maximum target of about 12 drawing updates per second; drops advance once per redraw. This is throttling rather than fully delta-time-integrated movement.
- Final canvas CSS uses z-index: -1, pointer-events: none, background-color: #040805, and opacity: 0.1. The .theme-matrix .site-shell isolation rule remains. The user removed the experimental section-background transparency block and preferred adjusting rain opacity directly; the screenshot and user report confirm the final appearance is satisfactory.
- Random starting rows are negative CSS-pixel row counts, so columns enter at different times. On resize, oldDrops[i] ?? randomStartingRow() retains existing positions, including row zero, and initializes new columns.
- matchMedia('(prefers-reduced-motion: reduce)') controls startup and reacts to preference changes: cancel/clear while reduced motion is requested, restart a single frame loop when allowed, and remove the listener on unmount.
- viewportWidth/viewportHeight hold logical CSS-pixel dimensions. On mount/resize, canvas.width/height are multiplied by devicePixelRatio and rounded, then ctx.setTransform(ratio, 0, 0, ratio, 0, 0) scales the drawing context. Columns, start positions, clearing/fading, and offscreen tests use logical dimensions, retaining 16px glyphs and the same redraw rate. A DPR-only change without resize is not separately monitored.
- An in-memory Node harness passed DPR 1/1.25/2, resize/transform reset, logical column/glyph sizing, row-zero preservation, reduced-motion startup/toggling, and cleanup checks. This is simulated API verification, not visual validation on physical high-DPI hardware.
- The WD Ghaster currentColor alpha mask is implemented in both language Select slots. .ghaster-icon uses the transparent wd_128x128.png as mask-image, mask-mode: alpha, contain/center/no-repeat, and background-color: currentColor; .language-flag supplies dimensions. The other flags remain images. Earlier snippets/rain references remain under ignored special_folder/.

## Project interactions

| Component | Documentation | Use in this project |
|---|---|---|
| Popover | [Popover](https://primevue.dev/popover/) | Asks for confirmation before opening a demo in a new tab. |
| Chip | [Chip](https://primevue.dev/chip/) | Technology labels in project cards/filter controls and name/proficiency pairs in the dedicated Skills section. |
| FocusTrap directive | [FocusTrap](https://primevue.dev/focustrap/) | Keeps keyboard focus within the demo-confirmation overlay. |
| Ripple directive | [Ripple](https://primevue.dev/ripple/) | Click feedback on selected buttons and controls. Enabled in PrimeVue configuration and registered as a directive. |
| Skeleton | [Skeleton](https://primevue.dev/skeleton/) | Placeholder cards while the browser fetches the static project JSON. |

## Summary, progress, and contact

| Component or feature | Documentation | Current use |
|---|---|---|
| Skills/proficiency | [Chip](https://primevue.dev/chip/) | A standalone #skills section groups the full Technology catalog by its database categories. Each Chip pairs the technology name with a translated self-assessed proficiency label. Replaces the unused MeterGroup placeholder. |
| ProgressSpinner | [ProgressSpinner](https://primevue.dev/progressspinner/) | Determinate completion display in both layouts, with larger percentage text. A null value hides it; exactly 100 uses the translated Complete label, and lower values use In progress. The accessible percentage announcement is also translated. |
| Contact form | [PrimeVue Forms](https://primevue.dev/forms/) | Deferred. The Contact section currently provides translated contact information and external links. A submission form would need a server endpoint or form service. |

## PostgreSQL schema and data

- [Schema SQL](database/schema/Zegirdor_Portfolio_database_schema_v0.5.sql) defines `Repository`, `Technology`, and the `Repository_Technology` junction table, their constraints, and indexes.
- [Population SQL](database/data/Zegirdor_Portfolio_data_population_v0.5.sql) records technology/proficiency values, the wedding project, and its technology associations.
- Repository names/descriptions use language-keyed JSONB. The full Technology catalog is now exported with id, name, category, and proficiency for Skills, separately from the technology-name tags attached to projects.
- The SQL scripts are reference/setup files. The deployment workflow does not execute them. The exporter performs SELECT queries and publishes only repositories marked visible.

## Static export and screenshots

1. [scripts/export-projects.js](scripts/export-projects.js) queries visible repositories and joins their technology tags.
2. It copies each configured screenshot from the filesystem path stored in PostgreSQL into `public/images/project_screenshots/`, naming the copy from the project ID and file extension.
3. Each generated screenshot copy receives mode `0o644` so the deployed image can be read by Nginx.
4. It writes public/data/projects.json with localized project content, links, tags, version/date, authors, completion, and image URLs. A separate SELECT ID, Name, Category, Proficiency FROM Technology ORDER BY Category, Name writes public/data/technologies.json for every technology, even without project associations. Neither output includes database credentials or screenshot source paths.
5. Vite packages generated assets into dist/. Independent onMounted callbacks fetch the project/technology JSON. skillGroups uses a computed Map and Array.from to derive category groups without hardcoding database data. projectImageUrl() prefixes the Vite base path and uses images/default-project-image.svg when screenshotUrl is null.

`npm run build` runs the exporter and then Vite. The workflow separates those operations so it can upload the exported assets before compiling the frontend. Extension extraction/validation, generated filename/source preparation, mkdir, copyFile, and chmod now share the per-project try/catch. A path without an extension warns instead of aborting, keeps screenshotUrl null, and allows later projects and the technology catalog to export. Other caught filesystem failures retain the same fallback. Copying the required shared default remains outside that catch and still aborts on failure.


Before the project loop, the exporter copies the shared default-project-image.svg from PORTFOLIO_SCREENSHOT_DIR when configured, or /mnt/hdd320_1/assets/zegirdor_portfolio/default-project-image.svg on the server, into public/images/default-project-image.svg and sets mode 0644. The directory uses an underscore (zegirdor_portfolio); the earlier hyphen spelling caused ENOENT and was corrected by the user, who then confirmed a successful build.

Connection values are plain values in the ignored `.env.local` file for local use. GitHub Actions injects the same five `PG*` settings through repository secrets; secret values contain no assignment prefix or surrounding env-file quotes. Database secrets do not use the `VITE_` prefix.

Windows builds can read PostgreSQL over the LAN and use PORTFOLIO_SCREENSHOT_DIR=special_folder/project_screenshots for local image copies named by ID and the database path's extension. The override is resolved relative to the project root unless absolute; without it, the exporter uses database filesystem paths. The user confirmed local build/preview works. The corrected special_folder/ ignore rule excludes local sources; generated public/ copies are published. npm run dev serves already-exported public/ assets and does not rerun the exporter.

## Build and deployment

The [deployment workflow](.github/workflows/deploy.yml) runs on pushes to `main` and supports manual dispatch. Its jobs also check the branch so manually selecting another branch cannot deploy it.

- `build-on-homeserver` exports database data and screenshots, uploads `public/` as a same-run fallback snapshot, builds with Vite on Node.js 24, and uploads the deployment artifacts.
- `build-on-github` runs only after a failed home-server build. It downloads that snapshot and runs Vite without querying PostgreSQL or reading the server's SDB filesystem.
- Both deployment jobs wait for both build outcomes and select artifacts from the successful build. They deploy to GitHub Pages and the Nginx document root.
- The fallback requires the current-run exported-assets snapshot. A failed export cannot be recovered by the GitHub build, and an offline runner may remain queued rather than failing immediately.

[GitHub workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts) pass exported assets and built files between jobs.

The owner previously confirmed local/home-server builds, screenshot HTTP 200, GitHub Pages data/images, an export of 1 project/22 technologies, and interface/category/proficiency translations. The header and portrait layout were accepted, and Skills loading was observed. Mocked exporter checks passed extensionless paths, EACCES/ENOENT, chmod EPERM, valid/absent screenshots, continued exports, and pool cleanup; a missing shared default still aborts. No real database edge-case export, fresh build/deployment, or GitHub fallback execution was verified during this update.
