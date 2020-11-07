import axios from 'axios'
import { Cookies } from 'quasar'

let url = `${window.location.protocol}//${window.location.hostname}`

if (process.env.APP_API_URL) {
  url = process.env.APP_API_URL
}

url = `${url}:1337`

export const baseUrl = url

const client = (async function () {
  let token = ''

  if (process.env.NODE_ENV !== 'development') {
    // load config from the "remote" file
    try {
      const config = await axios.get('/config.json').then(result => result.data)

      if (config.API_TOKEN) {
        token = config.API_TOKEN
      }
    } catch (error) {
      console.error(error)
    }
  } else {
    // try to set it via cookie
    token = Cookies.get('APP_TOKEN')
  }

  const client = axios.create({
    baseURL: baseUrl,
    timeout: 30000,
    headers: {
      Authorization: `Bearer ${token}`
    }
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
