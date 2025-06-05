import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { VueTelegramPlugin } from 'vue-tg';
import router from './routes';

createApp(App).use(VueTelegramPlugin).use(router).mount('#app');
