# ZegirdorDev Portfolio

A responsive, single-page portfolio built with Vue 3, Vite, and PrimeVue. PostgreSQL supplies project and technology/proficiency records during the build; the published website consists of static files served by GitHub Pages and Nginx on the Debian home server.

## Current features

- Project cards with grid and list layouts, screenshots, localized names/descriptions, version/date, technology tags, and repository/demo links.
- Technology filters that match all selected technologies.
- Demo confirmation through a Popover, keyboard focus trapping, Ripple feedback, and loading skeletons.
- Optional completion percentages, labeled Complete at 100% and In progress below 100%, with translated labels. In list view, progress appears below the screenshot.
- English and Spanish interface and accessibility translations through Vue I18n, sharing one URL. Navigation, selectors, project controls, screenshot descriptions, and completion announcements use locale messages; the user manually checked the translations.
- A toolbar language selector with flags and a theme selector with icons; each has custom dropdown and selected-value templates.
- Light, Dark, and Matrix themes with semantic PrimeVue colors. Matrix has its own Aura-derived palette, terminal typography, and subtle animated digital rain.
- A dedicated Skills/My stack section with database-derived category groups, technology/proficiency Chips, bilingual proficiency labels, and a self-assessment disclaimer.
- About content and contact links; there is no contact submission form.
- A GIF favicon referenced from `public/favicon.gif`.

See [TODO.md](TODO.md) for remaining work and [implementations.md](implementations.md) for component documentation and implementation details.

## Stack

- Vue 3, Vite, and Vue I18n
- PrimeVue 5, Aura from `@primeuix/themes`, and PrimeIcons
- Node.js 24 and node-postgres (`pg`) for the build-time export
- PostgreSQL for projects, technologies, and their associations
- GitHub Actions, GitHub Pages, and a self-hosted Linux runner
- Nginx for the home-server deployment

## How project data reaches the page

1. `scripts/export-projects.js` connects to PostgreSQL using the build environment.
2. It selects repositories with `Is_Visible = TRUE`, joins their technology tags, and orders them by display order, project date, then ID.
3. Configured screenshots are copied into `public/images/project_screenshots/<id>.<extension>`. Generated copies receive mode `0644` for Nginx readability.
4. The exporter writes public/data/projects.json and separately selects the full Technology catalog into public/data/technologies.json. The latter contains id, name, category, and proficiency, including technologies not attached to projects. Neither file contains database credentials or screenshot source paths.
5. Vite copies these assets into `dist/` alongside the compiled frontend.
6. Independent onMounted callbacks fetch data/projects.json and data/technologies.json relative to the Vite base URL. Project filtering, locale switching, and skill grouping then run in the browser.

The browser does not query PostgreSQL. Database changes appear after a new export and build/deployment. Caught per-project directory/copy/permission failures log the original error and leave screenshotUrl null so the frontend uses the shared default. A missing file extension still aborts before that catch, and failure to copy the required shared default image also stops the export.

## Database setup

The repository includes SQL reference/setup scripts:

- [Schema](database/schema/Zegirdor_Portfolio_database_schema_v0.5.sql)
- [Population data](database/data/Zegirdor_Portfolio_data_population_v0.5.sql)

The schema defines:

| Table | Purpose |
|---|---|
| `Repository` | Localized project content, repository/demo URLs, screenshot source path, version/date, authors, completion, visibility, and display order. |
| `Technology` | Technology names, categories, and personal proficiency levels. |
| `Repository_Technology` | Many-to-many associations between projects and technologies. |

Create the database and apply the schema/population scripts separately as appropriate for your environment. They are not executed by `npm run build` or GitHub Actions. The exporter only reads data; its account needs SELECT access to these tables.

Project names and descriptions are JSONB objects keyed by locale, such as `{"en": "Wedding invitation", "es": "Invitación de boda"}`.

## Local configuration and secrets

Use Node.js 24 and install the locked dependencies:

```sh
npm ci
```

Create an ignored `.env.local` in the project root with your own values:

```dotenv
PGHOST=your-database-host
PGPORT=5432
PGDATABASE=your_database
PGUSER=portfolio_reader
PGPASSWORD=replace-with-your-password
VITE_PRIMEUI_LICENSE=replace-with-your-license

# Optional: use local screenshot copies instead of database filesystem paths.
PORTFOLIO_SCREENSHOT_DIR=special_folder/project_screenshots
```

The exporter requires all five `PG*` settings. Node loads `.env.local` for the export; Vite loads it for the frontend build/development server. Values are literal connection values, not JavaScript expressions such as `process.env.username`.

Do not commit credential files or put database settings under a `VITE_` name. Vite exposes `VITE_` values to client code: `VITE_PRIMEUI_LICENSE` is intentionally read by the frontend's PrimeVue configuration, unlike the server-side `PG*` settings.

### Local screenshot copies

On Windows, a Linux screenshot path such as `/mnt/...` is not directly accessible. Set `PORTFOLIO_SCREENSHOT_DIR` to a local directory and name each copy using the project ID and the extension from its database screenshot path:

```text
special_folder/
  project_screenshots/
    1.png
    default-project-image.svg
```

The override directory must also contain default-project-image.svg. Without an override, the shared default is read from /mnt/hdd320_1/assets/zegirdor_portfolio/default-project-image.svg (underscore directory) and copied to public/images/default-project-image.svg with mode 0644.

A relative override directory is resolved from the project root; an absolute directory also works. With the variable set, the exporter uses that directory for every configured screenshot. Without it, it uses the original paths from PostgreSQL. This is a source override, not an automatic retry after a failed copy.

The database screenshot path must still be present and have an extension. The override changes where the file is read, not which projects have screenshots. Local builds still require database access.

Keep local source copies out of Git using an unquoted `/special_folder/` entry in `.gitignore`. The exporter copies the selected images into `public/`, and those generated copies are included in the published website.

## Develop, build, and preview

Generate or refresh both JSON catalogs and screenshots without compiling the frontend:

```sh
node --env-file-if-exists=.env.local scripts/export-projects.js
```

Then start the development server:

```sh
npm run dev
```

`dev` serves the generated files in `public/` and updates Vue/CSS changes live. It does not run the exporter: rerun the export when database content or source screenshots change.

Build the exported data and frontend together:

```sh
npm run build -- --base=./
```

`npm run build` runs the exporter first, then Vite. The relative base above supports the GitHub Pages project URL and the Nginx site root. Output is written to `dist/`.

Preview that output locally:

```sh
npm run preview
```

`preview` serves the last production build. Source changes require rebuilding before they appear there. The local build and preview with the screenshot override have been confirmed by the project owner.

## Languages and themes

Interface messages live in [en.json](src/locales/en.json) and [es.json](src/locales/es.json). Vue I18n starts with Spanish and uses Spanish as its configured fallback; the app restores a valid saved language when available.

Database project text is handled separately: `projectText()` chooses the active locale, falls back to English, and also accepts plain strings.

| Preference | Local Storage key | Behavior |
|---|---|---|
| Language | `zegirdor-portfolio-language` | Persists English or Spanish. |
| Theme | `zegirdor-portfolio-theme` | Persists the selected Light, Dark, or Matrix theme name. |

Each theme definition stores its name, icon, and preset. The watcher looks up that definition, calls usePreset(), applies the matching theme-* class to html, and saves the selected name. Aura supplies Light/Dark using .theme-dark; src/themes/matrix.mjs supplies Matrix. Site CSS uses semantic tokens for backgrounds, text, and borders.

Matrix uses accent #1EFF5A, background #040805, and foreground #00FF40. src/font.css registers MatrixTerminal from TerminalVision.otf and Wingdings from wingding.woff. MatrixRain.vue mounts only for Matrix and unmounts when another theme is selected, cancelling its animation frame and removing resize listeners. Its canvas targets about 12 redraws per second with opacity 0.1 and pointer-events: none. Reduced-motion suppression and high-DPI scaling remain follow-ups.

**WD Ghaster** is an optional novelty locale (`wd`) that reuses English messages through `wd: en`; it has no separate JSON file. Selecting it applies `.locale-wd` and the Wingdings font registered in `src/font.css` from `src/assets/fonts/wingding.woff` (or an installed Wingdings font). The language selector remains readable, and PrimeIcons retain their own font. WD is not saved over the normal language preference, so refreshing restores the saved English/Spanish choice. Its language icon uses the transparent PNG as a CSS alpha mask with currentColor in both the dropdown and selected value, adapting to the surrounding text color.

### Localization details

The locale files include accessibility labels under accessibility, selector labels under preferences, control/loading text under projects_section, and parameterized screenshot/completion text under projects. The screenshot description uses {name} with a translated unnamed-project fallback; completion announcements use {percentage}.

The immediate language watcher also reads meta.title and meta.description to update the browser title and description, and sets html.lang to the selected language (wd uses en). The initial values in index.html remain English by choice and are replaced once JavaScript runs.

PrimeVue's selector announcements use the primevue messages in the same JSON files. usePrimeVue() supplies the configuration, and the language watcher updates selectionMessage, emptySelectionMessage, and emptyMessage using Object.assign. Vue I18n's {count} receives the literal {0} so PrimeVue can substitute the selected-item count afterward. This keeps the current selectors' internal messages synchronized with the page.

The owner manually verified the existing interface translations and the new proficiency labels. The shared default-project-image.svg is language-neutral, and the project-loading error describes unavailable project data. Skills category headings still display the database category names directly; their translations and visible skills loading/error/empty states remain follow-ups.

## Exported project format

The generated JSON contains an array with these fields:

| Field | Content |
|---|---|
| `id` | Stable database identifier used by Vue. |
| `name`, `description` | Locale-keyed JSON objects from PostgreSQL. |
| `repositoryUrl` | Source repository link. |
| `demoUrl` | Optional live demo link. |
| `screenshotUrl` | Relative generated image URL, or null for the default image. |
| `version` | Optional version label. |
| `projectDate` | Optional date formatted as `YYYY-MM-DD`. |
| `authors` | Author-name array. |
| `technologies` | Technology-name array used by project tags and filters. |
| `completion` | Optional numeric completion percentage from 0 to 100. |

The frontend prefixes image URLs with `import.meta.env.BASE_URL` and uses `images/default-project-image.svg` when no screenshot URL is provided.

## Exported skills format

public/data/technologies.json contains an array of objects with id, name, category, and proficiency. IDs are exported as strings by node-postgres for bigint identifiers; names and proficiency/category values come directly from PostgreSQL.

App.vue stores this catalog in skills. Its computed skillGroups builds a Map keyed by category and converts it into { category, items } objects with Array.from. This derives the groups and their order from the export instead of maintaining a frontend category list. The responsive #skills section renders two columns that stack on small screens.

The root-level proficiency messages in en.json/es.json translate the stored levels. For lookup only, very high becomes very_high through replaceAll(' ', '_'); the database value remains unchanged. The lookup is `proficiency.<normalized-value>`, not `skills_section.proficiency`. Technology names remain proper names.

skillsLoading and skillsLoadError are tracked separately from the projects request, but visible loading/error/empty UI is not implemented yet.

## GitHub Actions deployment

The [workflow](.github/workflows/deploy.yml) runs on pushes to `main` and supports manual dispatch from GitHub Actions. Each job checks `refs/heads/main`, so a manual run selected on another branch cannot build or deploy through these jobs.

Configure these repository Actions secrets:

| Secret | Used by |
|---|---|
| `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` | The home-server database export. |
| `VITE_PRIMEUI_LICENSE` | PrimeVue configuration in both frontend build jobs. |

Enter each secret's value without a `NAME=` prefix or surrounding env-file quotes. CI injects environment variables directly; it does not require uploading `.env.local`. The optional local screenshot override is not configured by the workflow.

### Server-first build and fallback

1. **`build-on-homeserver`** runs on the self-hosted runner with Node.js 24. It installs dependencies, checks required settings, and exports the database records and server screenshots.
2. Before compiling, it uploads `public/` as `zegirdor-portfolio-exported-assets`, a snapshot for this workflow run. It then runs Vite with `--base=./` and uploads artifacts for both deployment targets.
3. **`build-on-github`** runs on `ubuntu-latest` only if the home-server build job fails. It downloads that run's exported-assets snapshot, builds with Vite, and uploads fallback deployment artifacts. It does not query PostgreSQL or read the private screenshot mount.
4. **Both deployment jobs** wait for both build outcomes and select the successful build's artifacts. They may run independently once their conditions are met:
   - GitHub Pages uses the `github-pages` environment and the selected Pages artifact.
   - The home-server deployment downloads the selected artifact, removes the current document-root contents, and copies the new static output to `/var/www/nodejs/zegirdor-portfolio`.

The fallback requires a successful export and snapshot upload from the current run. It cannot recover a failed database/image export. An unavailable self-hosted runner may leave the primary job queued rather than trigger a failure. Publishing to the home server also still requires that runner.

Workflow concurrency uses the shared group `zegirdor-portfolio-deploy` with `cancel-in-progress: false`, preventing overlapping runs in that group without cancelling the active run.

### Server requirements

- A registered self-hosted runner with Node.js 24 support and network access to PostgreSQL.
- A database account with SELECT access and runner traversal/read permissions for screenshot source files.
- Write access to `/var/www/nodejs/zegirdor-portfolio` and Nginx read access to the published files.
- An existing Nginx site configuration pointing to that document root; the workflow publishes static files and does not install or reload Nginx configuration.
- GitHub Pages configured to deploy through GitHub Actions.

The project owner has confirmed successful local/home-server builds, live screenshot HTTP 200 and GitHub Pages data/image checks for the previous release. The owner also confirmed a standalone export of 1 project and 22 technologies and tested the Skills/proficiency rendering. Deployment of this latest feature and execution of the GitHub fallback path were not verified during this documentation update.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
