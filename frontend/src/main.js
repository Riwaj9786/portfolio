import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { installPortfolioMotion } from './motion/portfolioMotion'
import 'primeicons/primeicons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const app = createApp(App)

installPortfolioMotion(app)
app.use(router)

app.mount('#app')
