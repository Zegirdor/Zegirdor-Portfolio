# ZegirdorDev Portfolio

A clean, professional portfolio landing page. The site will be generated as static files from PostgreSQL records and served by Nginx on the Debian homeserver.

## Stack

- Vue 3 for the frontend
- Vite for development and static builds
- PrimeVue for UI components, icons, and theme tokens
- PostgreSQL as the source of project entries
- Nginx for serving the generated site

## Current state

The Vue/Vite app is scaffolded and PrimeVue is installed. The page has a responsive portfolio layout, a DataView with grid/list layouts, Card project entries, technology chips, a light/dark toggle, a demo confirmation popover, optional determinate project progress, and loading skeletons. The generated `public/data/projects.json` is currently empty.

The database build step is not connected yet. The next implementation step is to agree on the PostgreSQL schema and SDB mount path, then add a Node build script that:

1. Reads public project rows from the local `portfolio` PostgreSQL database.
2. Copies each selected screenshot from SDB into the build's static assets, using a default image when one is missing.
3. Writes project data to `public/data/projects.json`.
4. Runs the Vite production build.

The visitor's browser receives only generated files. It cannot access PostgreSQL or arbitrary server filesystem paths. Data or image changes appear after a new build and deployment.

## Run locally

```sh
npm run dev
```

Create a production build with:

```sh
npm run build
```

The static build is written to `dist/`. Vite's preview server is for local preview, not production hosting; use Nginx on the server.

## Security and deployment

- Never expose PostgreSQL through Cloudflare Tunnel or the public web server.
- The build script should use a least-privilege read-only database role and server-side environment variables.
- Keep credentials out of Git and browser bundles.
- Copy only selected screenshots into the deployment output; do not expose the SDB mount itself.
- Keep the portfolio document root separate from the wedding site's deployment directory.
- The self-hosted GitHub Actions runner has no sudo privileges; do not add untrusted workflow triggers.

## Data model notes

The database is planned as `portfolio`; `repository` is the proposed project table name. Candidate fields include `id`, `name`, `description`, `version`, a project date, `repository_url`, optional demo and screenshot paths, `visible`, and timestamps. PostgreSQL has no native URL type; use `TEXT` and validate URLs in the build/application layer.

For a tiny fixed vocabulary, `TEXT[]` is simple. For a reusable technology catalog and consistent chips, prefer a `technology` table plus a join table from projects to technologies. A PostgreSQL enum is less convenient when the vocabulary changes. Keep a project's date separate from `created_at`, which records when the database row was added.

See [implementations.md](implementations.md) for the component reference. `Memory.md` is ChatGPT's local continuity file and is intentionally excluded from the public Git repository.
