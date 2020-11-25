import axios from 'axios'
import { Cookies } from 'quasar'
const MAX_REQUESTS_COUNT = 10
const INTERVAL_MS = 20
let PENDING_REQUESTS = 0

const client = (async function () {
  let url = `${window.location.protocol}//${window.location.hostname}:1337` // used mostly for localhost
  let token = ''

  if (process.env.NODE_ENV !== 'development') {
    // load config from the "remote" file
    try {
      const config = await axios.get('/config.json').then(result => result.data)

      if (config.API_TOKEN) {
        token = config.API_TOKEN
      }

      if (config.APP_API_URL) {
        url = config.APP_API_URL
      }
    } catch (error) {
      console.error(error)
    }
  } else {
    // try to set it via cookie
    token = Cookies.get('APP_TOKEN')
  }

  const client = axios.create({
    baseURL: url,
    timeout: 30000,
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  // limit requests so it won't block the UI
  client.interceptors.request.use(function (config) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (PENDING_REQUESTS < MAX_REQUESTS_COUNT) {
          PENDING_REQUESTS++
          clearInterval(interval)
          resolve(config)
        }
      }, INTERVAL_MS)
    })
  })

  client.interceptors.response.use(function (response) {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1)
    return Promise.resolve(response)
  }, function (error) {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1)
    return Promise.reject(error)
  })

  return Promise.resolve(client)
})()

export default async ({ Vue, store }) => {
  // make sure we are logged out in case we don't have the token specified - in case of local development
  if (process.env.NODE_ENV === 'development' && !Cookies.get('APP_TOKEN')) {
    if (store.getters['auth/loggedIn']) {
      store.dispatch('auth/logout')
    }
  }

  Vue.prototype.$axios = await client
}

export { client }
