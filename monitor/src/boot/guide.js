export default ({ store, router }) => {
  // always close the guide when navigation changed
  router.beforeEach((from, to, next) => {
    store.commit('guide/route', '')
    store.commit('guide/active', false)

    return next()
  })
}
