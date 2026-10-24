import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import Ripple from 'primevue/ripple'
import FocusTrap from 'primevue/focustrap'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(PrimeVue, {
  license: import.meta.env.VITE_PRIMEUI_LICENSE,
  ripple: true,
  theme: {
    preset: Aura,
    options: { darkModeSelector: '.theme-Dark' },
  },
})

app.directive('ripple', Ripple)
app.directive('focustrap', FocusTrap)
app.mount('#app')
