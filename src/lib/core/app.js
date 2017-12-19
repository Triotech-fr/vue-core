import Vue from 'vue';
import Voca from 'voca';
import I18n from '@triotech/vue-core/src/lib/core/i18n';
import Router from '@triotech/vue-core/src/lib/core/router';
import Store from '@triotech/vue-core/src/lib/core/store';
import Env from '@triotech/vue-core/src/lib/core/env';
import App from '@/App';

Vue.config.performance = true;
Vue.config.productionTip = false;

Vue.mixin({
  // https://github.com/declandewet/vue-meta
  metaInfo() {
    const name = this.$options.name;
    let metaInfo = {};
    const regex = new RegExp(/(index|show|edit|delete)?page$/i);
    if (name && name.match(regex)) {
      const page = Voca(name.replace(regex, '')).snakeCase().lowerCase().value();
      metaInfo = {
        title: this.$t(`pages.${page}.meta.title`),
        meta: [{
          name: 'description',
          content: this.$t(`pages.${page}.meta.description`),
        }],
      };
    }
    return metaInfo;
  },
});

const app = new Vue({
  i18n: I18n,
  router: Router,
  store: Store,
  env: Env,
  render: h => h(App),
  methods: {
    run(config = {}) {
      this.$mount(config.el || '#app');
    },
  },
});

export default app;
