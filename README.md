# ZegirdorDev Portfolio

A single-page portfolio built with Vue 3, Vite, and PrimeVue. It is deployed as static files to GitHub Pages and to Nginx on the Debian home server.

## Current state

The English-language page has a responsive header, hero section, Projects, About, and Contact sections. Projects support grid and list layouts, filtering by technology, repository links, and an optional confirmation before opening a demo. The theme toggle switches between light and dark modes and saves the choice in the browser's Local Storage.

Project data is loaded from `public/data/projects.json`, which currently contains an empty array. The PostgreSQL schema and the build script that will read public entries and package screenshots have not been implemented yet. The browser receives only the generated JSON and image files; it does not connect to PostgreSQL or access server filesystem paths.

The About section and its MeterGroup are placeholders. The Contact section does not yet have a form. English/Spanish translations, a language selector, and separate language URLs are still undecided or pending. See [TODO.md](TODO.md) for planned work and [implementations.md](implementations.md) for the selected UI components.

## Stack

- Vue 3 and Vite
- PrimeVue 5 with the Aura theme and PrimeIcons
- PostgreSQL as the planned source of project records
- Nginx for the home-server deployment
- GitHub Actions for building and publishing the static site

## Run and build locally

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Create a production build:

```sh
npm run build -- --base=./
```

The output is written to `dist/`. The relative base path supports deployment under a GitHub Pages project URL as well as the Nginx site root. To preview a production build locally, run:

```sh
npm run preview
```

## Project data format

The frontend currently reads a JSON array from `public/data/projects.json`. Each project can use these fields:

| Field | Purpose |
|---|---|
| `id` | Stable identifier used by Vue for the project entry |
| `name` | Project title |
| `description` | Short project description |
| `version` | Optional version label |
| `projectDate` | Optional project date |
| `technologies` | Array of technology labels used for filtering |
| `repositoryUrl` | Repository link |
| `demoUrl` | Optional full demo link |
| `screenshotUrl` | Optional screenshot URL in the generated site |
| `screenshotAlt` | Optional screenshot description |
| `completion` | Optional completion percentage shown for in-progress projects |

The future database build step should select only entries marked visible, copy approved screenshots into the static output, use the default image when one is not supplied, and generate this JSON. Database credentials and screenshot filesystem paths must stay server-side and must not be included in the generated site.

## Deployment

The workflow in `.github/workflows/deploy.yml` runs for pushes to `main` and supports manual dispatch. It first builds on a GitHub-hosted runner. If that build fails, it attempts the build on the self-hosted home-server runner. The successful build output is then deployed to both destinations:

- GitHub Pages
- Nginx document root: `/var/www/nodejs/zegirdor-portfolio`

The workflow requires the `VITE_PRIMEUI_LICENSE` GitHub Actions secret for the build. Keep database credentials out of the repository and out of the browser bundle; the database integration is not part of the current build yet.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
