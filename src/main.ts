import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import {
  allComponents,
  provideFluentDesignSystem
} from '@fluentui/web-components';

provideFluentDesignSystem().register(allComponents);

createApp(App).use(createPinia()).mount('#app');
