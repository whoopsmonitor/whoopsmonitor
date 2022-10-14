import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'

import config from './config'
import auth from './auth'
import guide from './guide'
import issue from './issue'
import healthindex from './healthindex'

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      config,
      auth,
      guide,
      issue,
      healthindex
    },
    plugins: [
      vuexLocal.plugin
    ],

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING
  })

  return Store
})
