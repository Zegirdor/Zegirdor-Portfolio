# Pending Tasks

- [x] Localize or remove the English text/title/description embedded in public/images/default-project.svg (image work deferred by the user)
- [x] Update project-loading error messages now that the database export is configured
- [ ] Add a Matrix theme
- [ ] Choose and implement the skills/proficiency display; MeterGroup currently has no data
- [ ] Decide whether to add a contact submission form and, if so, choose its endpoint/service
- [ ] Add a profile picture: https://i.imgur.com/lj5y1Lh.jpeg (replace the URL with another image or use a local image)
- [ ] Review exporter TODOs: share the screenshot path definition, improve SQL formatting, and review the explicit JSON mapping
- [ ] Preserve the original filesystem error details when screenshot copying fails
- [ ] Change screenshot retrieval so an unreadable configured source uses the default screenshot instead of aborting the build
- [ ] Confirm WD font rendering and language-selector readability in the browser
- [ ] Get rid of the HelloWorld.vue file.

# Completed Tasks

- [x] Translate the remaining active interface text and accessibility labels (navigation, selectors, layouts, filters, loading, screenshot descriptions, and completion announcements)
- [x] Add translated screenshot-name fallback and parameterized completion announcements in both layouts
- [x] Update page title, description, and html.lang when the selected language changes; retain initial English HTML defaults by choice
- [x] Synchronize PrimeVue selector selection/empty messages with the selected language
- [x] Manually verify the interface translations (confirmed by the user; embedded image text deferred)
- [x] Update PrimeVue to latest (licensed under latest version)
- [x] Confirm the PrimeUI license notice is gone with the PrimeVue 4 migration
- [x] Persist the selected theme in Local Storage
- [x] Replace the theme toggle with a Select offering Light, Dark, and Matrix options, including icons and custom option/selected-value templates
- [x] Fix the Dark theme palette using semantic PrimeVue tokens
- [x] Add English and Spanish locale files and configure Vue I18n
- [x] Add a toolbar language selector with flags and persist the selected language in Local Storage
- [x] Keep both languages on one URL; separate language URLs are not planned for this project
- [x] Refresh README.md for translations, selectors, database export, secrets, local development, and server-first deployment
- [x] Design the PostgreSQL schema and save initialization/population SQL under database/schema/ and database/data/ without credentials
- [x] Populate the database with the technology catalog, wedding project, and project/technology associations
- [x] Add the build-time PostgreSQL exporter for visible project records and SDB screenshots
- [x] Render localized JSONB project names/descriptions and resolve image URLs relative to the Vite base
- [x] Translate project labels, repository/demo actions, and demo-confirmation text
- [x] Build on the home server first, with a GitHub fallback that reuses the exported assets
- [x] Configure the runner's source screenshot access and restart its service; the user confirmed the server build succeeds
- [x] Set generated screenshot copies to mode 0644 for Nginx readability
- [x] Confirm screenshot HTTP 200 and project data/images on GitHub Pages (marked complete by the user)
- [x] Support local Windows builds with PORTFOLIO_SCREENSHOT_DIR and special_folder/project_screenshots; local build/preview confirmed
- [x] Ignore special_folder in Git using the corrected unquoted rule
- [x] Add a GIF favicon
- [x] Add the View demo button to list view and align/style its action row
- [x] Add version/date information and completion progress beneath the screenshot in list view
- [x] Enlarge the completion percentage text
- [x] Show translated Complete/Completado at 100% instead of In progress
- [x] Add WD Ghaster as an English-backed locale with Wingdings styling, readable language controls, and preserved PrimeIcons
- [x] Preserve the normal saved language when WD is selected and remove the duplicate wd.json
