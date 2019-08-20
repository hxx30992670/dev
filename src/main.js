/*import 'babel-polyfill'*/
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

import "jquery-ui/themes/base/all.css"
import ElementUi from "element-ui";
import "element-ui/lib/theme-chalk/index.css"
import "./assets/css/custom-theme/theme/index.css";
import uploader from "vue-simple-uploader";
Vue.use(ElementUi, {size: "small"});
Vue.use(uploader);
Vue.config.productionTip = false;

import "@/assets/css/reset.less";
import "@/assets/css/main.less";
import "@/assets/iconfont/iconfont.css";
import "@/assets/css/iconfont2/iconfont.css";

const vue = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
export default vue;
