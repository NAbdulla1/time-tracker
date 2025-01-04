import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia';
import { useStore } from './store';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.config.globalProperties.$store = useStore();

app.mount('#app');
