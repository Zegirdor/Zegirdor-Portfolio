import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import Ripple from 'primevue/ripple'
import FocusTrap from 'primevue/focustrap'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Aura,
    options: { darkModeSelector: '.app-dark' },
  },
})

app.directive('ripple', Ripple)
app.directive('focustrap', FocusTrap)
app.mount('#app')
