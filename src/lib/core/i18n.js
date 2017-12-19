import Vue from 'vue';
import VueI18n from 'vue-i18n';
import Webpack from '@triotech/vue-core/src/lib/helper/webpack';
import _ from '@triotech/vue-core/src/vendor/lodash';

Vue.use(VueI18n);

const I18n = new VueI18n({
  locale: 'fr',
  messages: _.merge(
    Webpack.find(require.context('json-loader!@triotech/vue-core/src/translations', false, /\.yml$/)),
    Webpack.find(require.context('json-loader!@/translations', false, /\.yml$/)),
  ),
});

// TODO replace vue-i18n with vuex-i18n (https://github.com/dkfbasel/vuex-i18n)
// import VueI18n from 'vuex-i18n';
// import Store from '@/lib/core/Store';
// Vue.use(VueXI18n.plugin, Store, {
//   onTranslationNotFound: (locale, key) => {
//     console.warn(`i18nx :: Key '${key}' not found for locale '${locale}'`);
//   },
// });
// Vue.i18n.add('fr', fr_FR)

export default I18n;
