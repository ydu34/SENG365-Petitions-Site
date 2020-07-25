import Vue from 'vue'
import App from './App.vue'

import axios from 'axios';
import VueAxios from 'vue-axios';
Vue.use(VueAxios, axios);

import VueRouter from 'vue-router';
Vue.use(VueRouter);
import routes from "./routes";

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

import Vuelidate from 'vuelidate'
Vue.use(Vuelidate)

import VueSocialSharing from 'vue-social-sharing'
Vue.use(VueSocialSharing);

import VueCookies from 'vue-cookies'
Vue.use(VueCookies)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'



const router = new VueRouter({
  routes: routes,
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }

});

new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
})
