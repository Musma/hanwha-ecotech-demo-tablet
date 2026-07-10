import { createApp } from 'vue'

import App from '@/app.vue'
import router from '@/router'
import { createAppPinia } from '@/shared/stores/pinia'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'
import 'vue-sonner/style.css'
import '@/assets/main.css'

const app = createApp(App)

app.use(createAppPinia())
app.use(router)

app.mount('#app')
