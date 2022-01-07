import { createApp } from 'vue';
import App from './App.vue';
import {
  allComponents,
  provideFluentDesignSystem
} from '@fluentui/web-components';

provideFluentDesignSystem().register(allComponents);

createApp(App).mount('#app');
