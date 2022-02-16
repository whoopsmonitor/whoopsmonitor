import axios from 'axios'
const MAX_REQUESTS_COUNT = 10
const INTERVAL_MS = 20
let PENDING_REQUESTS = 0
const API_URL = process.env.APP_API_URL
const API_TOKEN = process.env.API_TOKEN

const client = async function (API_URL, API_TOKEN) {
  let url = ''
  let token = ''

  token = API_TOKEN
  url = API_URL

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
}

const axiosFnc = async function () {
  const http = await client(API_URL, API_TOKEN)
  return http
}

export default async ({ Vue }) => {
  Vue.prototype.$axios = await client(API_URL, API_TOKEN)
}

export { axiosFnc }
