# Frontend Implementations

This page records the selected frontend technologies and PrimeVue components, their documentation links, and their role in the portfolio. The Vue/Vite foundation and the initial UI skeleton are already in the repository; the PostgreSQL build pipeline is still planned.

## Foundation

| Technology | Documentation | Use in this project |
|---|---|---|
| Vue | [Vue quick start](https://vuejs.org/guide/quick-start.html) | Frontend framework for reusable sections, project cards, theme state, and technology filters. |
| Vite | [Vite static deployment](https://vite.dev/guide/static-deploy) | Development server and production bundler. The output is static files for Nginx. |
| PrimeVue | [PrimeVue installation](https://primevue.dev/installation/) | Vue component library used for the selected controls and cards. Installed in the project. |
| Aura theme | [PrimeVue styled theming](https://primevue.dev/theming/styled/) | Starting design-token preset. `darkModeSelector` is configured as `.theme-Dark` to match the class applied by the theme watcher. The user reports the Dark palette still does not switch, so this remains under investigation. |
| PrimeIcons | [PrimeIcons](https://primevue.dev/icons/) | Icons for navigation, view controls, theme options, and external links. |

## Main content and navigation

| Component | Documentation | Use in this project |
|---|---|---|
| DataView | [DataView sorting example](https://primevue.dev/dataview/#sorting) | Main project listing, with a grid/list layout switch. The listing will be populated from generated static JSON based on PostgreSQL records. |
| Card | [Card advanced example](https://primevue.dev/card/#advanced) | Visual container for each project: screenshot, name, version/date, description, technology chips, progress (when applicable), and repository/demo links. |
| Toolbar | [Toolbar](https://primevue.dev/toolbar/) | Header bar for the site brand, Projects/About/Contact navigation, and theme selector. The earlier Card link was not the Toolbar documentation, so this is the corrected component URL. |
| Select | [Select](https://primevue.dev/select/) | Theme selector with Light, Dark, and Matrix choices. Custom `#option` and `#value` slots display each theme's icon and name; the selected theme name is persisted in Local Storage. The user's `.capitalize-text` class changes display only. |

## Project interactions

| Component | Documentation | Use in this project |
|---|---|---|
| Popover | [Popover](https://primevue.dev/popover/) | Confirmation prompt before opening a project's full demo site. |
| Chip | [Chip](https://primevue.dev/chip/) | Displays project technology labels and supplies the visual controls for filtering the project list. |
| FocusTrap directive | [FocusTrap](https://primevue.dev/focustrap/) | Keeps keyboard focus within the open demo confirmation overlay. It must not trap focus across the whole page. |
| Ripple directive | [Ripple](https://primevue.dev/ripple/) | Adds a click ripple to selected interactive controls such as buttons. |
| Skeleton | [Skeleton](https://primevue.dev/skeleton/) | Placeholder cards while the static project JSON loads in the browser. |

## Optional summary and progress displays

| Component | Documentation | Use in this project |
|---|---|---|
| MeterGroup | [MeterGroup](https://primevue.dev/metergroup/) | Possible summary of a meaningful portfolio metric or skill breakdown. The metric has not been chosen; it is currently a placeholder. |
| ProgressSpinner | [ProgressSpinner](https://primevue.dev/progressspinner/) | Optional determinate indicator for a project's saved completion percentage. A numeric value makes it a static project status display, not a live build indicator. |

## Later feature

| Feature | Documentation | Use in this project |
|---|---|---|
| Contact form | [PrimeVue form components](https://primevue.dev/forms/) | Form component has not been selected. A functional form will also need a server-side endpoint or a form service; the static page alone cannot deliver messages. |

## Static build and screenshots

The browser will read generated JSON and images from the built site. A Node build script will query PostgreSQL on the server, copy each selected screenshot from SDB into the public build assets, substitute a default image when no screenshot is set, and then run the Vite build. The database credentials and SDB filesystem paths remain server-side and are never shipped to the browser.
