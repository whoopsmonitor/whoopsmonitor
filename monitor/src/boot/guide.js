import 'intro.js/introjs.css'
import VueIntro from 'vue-introjs'

export default ({ app, Vue, store, router }) => {
  Vue.use(VueIntro)

  // always close the guide when navigation changed
  router.beforeEach((from, to, next) => {
    store.commit('configuration/hideGuide')
    store.commit('configuration/disallowGuide')
    return next()
  })
}
