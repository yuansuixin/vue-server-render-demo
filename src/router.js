import Vue from "vue";
import Router from "vue-router";
import Hell from "./components/Hello.vue";

Vue.use(Router);

export function createRouter() {
  return new Router({
    mode: "history",
    routes: [
      {
        path: "/hello",
        component: () =>
          import(/* webpackChunkName: 'hello' */ "./components/Hello.vue"),
      },
      {
        path: "/hello1",
        component: () =>
          import(/* webpackChunkName: 'hello1' */ "./components/Hello1.vue"),
      },
      {
        path: "/",
        component: Hell,
      },
    ],
  });
}
