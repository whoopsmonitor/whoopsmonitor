import { axiosFnc } from '../boot/axios'

const verifyLogin = async (store) => {
  if (!store.state.auth.token) {
    return false
  }

  const $axios = await axiosFnc()

  try {
    await $axios.post(`/v1/auth/login`, {
      password: store.state.auth.token
    })

    return true
  } catch (error) {
    // clear token
    store.commit('auth/setToken', '')
    return false
  }
}

export default ({ router, store }) => {
  router.beforeEach(async (to, from, next) => {
    //
    // user verified
    //
    if (await verifyLogin(store)) {
      // check login page
      if (to.name === 'auth.login') {
        return next({ name: 'dashboard' })
      }

      // continue as usual
      return next()
    }

    //
    // user not verified, continue with "guest" and "auth" meta
    //

    // routes marked as "guest" friendly (login page)
    if (to.meta.guest) {
      return next()
    }

    // some pages do not require authentication
    if (to.meta.auth === false) {
      return next()
    }

    return next({
      name: 'auth.login'
    })
  })
}
