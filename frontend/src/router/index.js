import { createRouter, createWebHistory } from "vue-router";
import Overview from "../views/Overview.vue";
import Profit from "../views/Profit.vue";
import Plays from "../views/Plays.vue";
import Holdings from "../views/Holdings.vue";
import About from "../views/About.vue";

const routes = [
  {
    path: "/",
    name: "Overview",
    component: Overview,
  },
  {
    path: "/profit",
    name: "Profit",
    component: Profit,
  },
  {
    path: "/plays",
    name: "Plays",
    component: Plays,
  },
  {
    path: "/holdings",
    name: "Holdings",
    component: Holdings,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
