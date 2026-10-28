import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import Ripple from 'primevue/ripple'
import FocusTrap from 'primevue/focustrap'
import es from './locales/es.json'
import en from './locales/en.json'
import './font.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(PrimeVue, {
  license: import.meta.env.VITE_PRIMEUI_LICENSE,
  ripple: true,
  theme: {
    preset: Aura,
    options: { darkModeSelector: '.theme-dark' }
  }
})

const i18n = createI18n({
  messages: { es, en, wd: en },
  locale: 'es',
  fallbackLocale: 'es',
  legacy: false
})

app.directive('ripple', Ripple)
app.directive('focustrap', FocusTrap)
app.use(i18n)
app.mount('#app')