import Vue from 'vue';
import { mapActions } from 'vuex';
import VueAxios from 'vue-axios';
import Axios from 'axios';
import Config from '@triotech/vue-core/src/lib/core/config';
import Router from '@triotech/vue-core/src/lib/core/router';
import Store from '@triotech/vue-core/src/lib/core/store';
import _ from '@triotech/vue-core/src/vendor/lodash';

Vue.use(VueAxios, Axios);

Axios.defaults.timeout = 10000;

const Ajax = new Vue({
  store: Store,
  computed: {
    oauthConfig: () => Config.get('oauth') || {},
    oauthStore: () => Store.state.oauth || {},
  },
  methods: {
    url(config) {
      let url = config && config.url;
      if (url && url.indexOf('://') === -1) {
        url = `${Config.host}${url}`;
      }
      return url;
    },
    sync() {
      this.wait = true;
      return this;
    },
    build(url, method, data = {}, config = {}) {
      return _.extend(config, { url, method, data });
    },
    get(url, data, config) {
      return this.request(this.build(url, 'GET', data, config));
    },
    post(url, data, config) {
      return this.request(this.build(url, 'POST', data, config));
    },
    put(url, data, config) {
      return this.request(this.build(url, 'PUT', data, config));
    },
    patch(url, data, config) {
      return this.request(this.build(url, 'PATCH', data, config));
    },
    delete(url, data, config) {
      return this.request(this.build(url, 'DELETE', data, config));
    },
    head(url, data, config) {
      return this.request(this.build(url, 'HEAD', data, config));
    },
    login(data) {
      return this.oauth(_.extend({
        grant_type: 'password',
      }, data), !!data.rememberMe);
    },
    refresh() {
      if (typeof this.oauthStore.refresh_token_expires_at === 'undefined' || (Number(new Date()) - this.oauthStore.refresh_token_expires_at) / 1000 > 0) {
        // no expiration date for refresh token, or refresh token expired, clear and redirect to /login
        this.setKeyValueAction({ key: 'oauth', value: null });
        Router.push('/login');
        location.reload();
      }

      return this.oauth({
        grant_type: 'refresh_token',
        refresh_token: this.oauthStore.refresh_token,
      });
    },
    oauth(data, commit = true) {
      return this.request(this.build('oauth/v2/token', 'POST', _.extend({
        client_id: this.oauthConfig.client_id,
        client_secret: this.oauthConfig.client_secret,
      }, data), { commit })).then((value) => {
        value.expires_at = (value.expires_in * 1000) + Number(new Date());
        value.refresh_token_expires_at = (value.refresh_token_lifetime * 1000) + Number(new Date());
        this.setKeyValueAction({ key: 'oauth', value, commit });
        return value;
      });
    },
    request(config = {}) {
      const promise = this.wait ? this.syncRequest(config) : this.asyncRequest(config);
      this.wait = null;
      return promise;
    },
    async syncRequest(config) {
      return await this.asyncRequest(config);
    },
    asyncRequest(config) {
      config.url = this.url(config);

      if (!_.isEmpty(this.oauthStore)) {
        if (!config.commit && (Number(new Date()) - this.oauthStore.expires_at) / 1000 > 0) {
          return this.refresh().then(this.asyncRequest.bind(this, config));
        }
        config.headers = _.extend({
          Authorization: `Bearer ${this.oauthStore.access_token}`,
        }, config.headers);
      }

      return this.$http.request(config)
        .then((res) => {
          let data = res.data;
          /* eslint-disable no-underscore-dangle */
          if (data._embedded && data._embedded.items) {
            data = data._embedded.items;
          }
          Store.data = data;
          Store[config.url] = data;
          return data;
        })
        .catch((error) => {
          const data = (error.response && error.response.data) || {};
          if (data.error === 'invalid_grant') {
            if (data.error_description.match(/expired/i) && error.response.status === 401) {
              delete config.headers;
              return this.refresh().then(this.asyncRequest.bind(this, config));
            } else if (data.error_description.match(/invalid/i) || ( data.error_description.match(/expired/i) && error.response.status === 400 )) {
              this.setKeyValueAction({ key: 'oauth', value: null });
              Router.push('/login');
              location.reload();
            }
          } else {
            /* eslint-disable no-console */
            console.error({
              response: error.response,
              request: error.request,
              message: error.message,
              config: error.config,
            });
          }
          throw error;
        })
      ;
    },
    ...mapActions(['setKeyValueAction']),
  },
});

export default Ajax;
