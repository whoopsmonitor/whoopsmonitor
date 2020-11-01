export default ({ store, router }) => {
  // always close the guide when navigation changed
  router.beforeEach((to, from, next) => {
    if (to.meta.docs) {
      store.commit('guide/docs', to.meta.docs)
    } else {
      store.commit('guide/docs', '')
    }

    return next()
  })
}
