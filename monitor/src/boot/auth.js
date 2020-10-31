export default ({ router, store }) => {
  router.beforeEach((to, from, next) => {
    if (to.meta.auth) {
      // we need to be logged in but token is missing
      if (!store.state.auth.token) {
        return next({
          name: 'auth.login'
        })
      }
    }

    // in case we are already logged in, then redirect to previuos URL
    if (to.meta.guest) {
      if (store.state.auth.token) {
        return next({
          name: 'dashboard'
        })
      }
    }

    next()
  })
}
