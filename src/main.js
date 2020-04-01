import Vue from "vue";
import App from "./App.vue";
import OfficeUIFabricVue from "office-ui-fabric-vue";
import "./registerServiceWorker";

Vue.config.productionTip = false;
Vue.use(OfficeUIFabricVue);

new Vue({
  render: h => h(App)
}).$mount("#app");
