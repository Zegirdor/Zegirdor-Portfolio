# ZegirdorDev Portfolio

A responsive, single-page portfolio built with Vue 3, Vite, and PrimeVue. PostgreSQL supplies project records during the build; the published website consists of static files served by GitHub Pages and Nginx on the Debian home server.

## Current features

- Project cards with grid and list layouts, screenshots, localized names/descriptions, version/date, technology tags, and repository/demo links.
- Technology filters that match all selected technologies.
- Demo confirmation through a Popover, keyboard focus trapping, Ripple feedback, and loading skeletons.
- Optional completion percentages, labeled Complete at 100% and In progress below 100%, with translated labels. In list view, progress appears below the screenshot.
- English and Spanish interface and accessibility translations through Vue I18n, sharing one URL. Navigation, selectors, project controls, screenshot descriptions, and completion announcements use locale messages; the user manually checked the translations.
- A toolbar language selector with flags and a theme selector with icons; each has custom dropdown and selected-value templates.
- Light and Dark themes with semantic PrimeVue colors. Matrix is selectable, but its distinct styling remains pending.
- About content and contact links. The skills MeterGroup has no data yet; there is no contact submission form.
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
4. The exporter writes `public/data/projects.json`. It includes public project fields and relative image URLs, without database credentials or source filesystem paths.
5. Vite copies these assets into `dist/` alongside the compiled frontend.
6. The browser fetches `data/projects.json` relative to the Vite base URL when the app mounts. Language changes and technology filters then run in the browser.

The browser does not query PostgreSQL. Database changes appear after a new export and build/deployment. A configured screenshot that cannot be copied stops the export before JSON is written; a project with no screenshot path uses the frontend's default image.

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
```

A relative override directory is resolved from the project root; an absolute directory also works. With the variable set, the exporter uses that directory for every configured screenshot. Without it, it uses the original paths from PostgreSQL. This is a source override, not an automatic retry after a failed copy.

The database screenshot path must still be present and have an extension. The override changes where the file is read, not which projects have screenshots. Local builds still require database access.

Keep local source copies out of Git using an unquoted `/special_folder/` entry in `.gitignore`. The exporter copies the selected images into `public/`, and those generated copies are included in the published website.

## Develop, build, and preview

Generate or refresh the project JSON and screenshots without compiling the frontend:

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

The theme watcher applies the matching `theme-*` class to `<html>`. Aura uses `.theme-dark` for Dark mode, while the site's CSS uses semantic tokens for backgrounds, text, and borders.

**WD Ghaster** is an optional novelty locale (`wd`) that reuses English messages through `wd: en`; it has no separate JSON file. Selecting it applies `.locale-wd` and the Wingdings font registered in `src/style.css` from `src/assets/fonts/wingding.woff` (or an installed Wingdings font). The language selector remains readable, and PrimeIcons retain their own font. WD is not saved over the normal language preference, so refreshing restores the saved English/Spanish choice.

### Localization details

The locale files include accessibility labels under accessibility, selector labels under preferences, control/loading text under projects_section, and parameterized screenshot/completion text under projects. The screenshot description uses {name} with a translated unnamed-project fallback; completion announcements use {percentage}.

The immediate language watcher also reads meta.title and meta.description to update the browser title and description, and sets html.lang to the selected language (wd uses en). The initial values in index.html remain English by choice and are replaced once JavaScript runs.

PrimeVue's selector announcements use the primevue messages in the same JSON files. usePrimeVue() supplies the configuration, and the language watcher updates selectionMessage, emptySelectionMessage, and emptyMessage using Object.assign. Vue I18n's {count} receives the literal {0} so PrimeVue can substitute the selected-item count afterward. This keeps the current selectors' internal messages synchronized with the page.

The interface translation work has been manually verified by the owner. English text embedded in public/images/default-project.svg is deferred as a separate image task. Rewording the already-translated project-loading error message also remains pending.

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

The frontend prefixes image URLs with `import.meta.env.BASE_URL` and uses `images/default-project.svg` when no screenshot URL is provided.

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

The project owner has confirmed successful local/home-server builds, live screenshot HTTP 200 and GitHub Pages data/image checks for the previous release. The current interface translations have been manually checked. Execution of the GitHub fallback path remains unverified.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
