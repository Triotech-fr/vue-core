import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from '%/routing';

Vue.use(VueRouter);

const vueRouterPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location, ...args) {
  const vm = this.app;
  if (vm.$f7) {
    const route = this.match(vm._.clone(location), this.history.current);
    if (route.path) {
      return vm.$f7.router.navigate(route.fullPath, args);
    }
  }
  return vueRouterPush.call(this, location, ...args);
};

const Router = new VueRouter({
  mode: window.cordova ? 'hash' : 'history',
  routes,
  scrollBehavior(to, from, savedPosition) {
    let scroll = { x: 0, y: 0 };
    if (to.hash) {
      scroll = { selector: to.hash };
    } else if (savedPosition) {
      scroll = savedPosition;
    }
    return scroll;
  },
});

// https://router.vuejs.org/en/advanced/navigation-guards.html
Router.beforeEach((to, from, next) => {
  const vm = Router.app;
  vm.$nextTick(() => {
    vm._.some(vm.$config.get('firewall'), (data, path) => {
      const store = vm._.isObject(data) ? data.store : true;
      const state = vm._.isObject(data) ? data.state : data;
      const push = to.path.match(path) && (store && !vm.$store.state[state]);
      if (push) {
        vm.$router.push(vm._.isObject(data) ? data.redirect : '/');
      }
      return push;
    });
    next();
  });
});

Router.beforeEach((to, from, next, notFound = '/404') => {
  if (!to.matched.length) {
    next(to.path === notFound ? '/' : notFound);
  } else {
    next();
  }
});

export default Router;
