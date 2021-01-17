const execa = require('execa')

module.exports = async function (url, topic) {
  let success = false
  let attempts = 0

  console.log(`[${topic}] (start) Check if URL is up.`)

  do {
    try {
      if (attempts > 10) {
        console.error(`[${topic}] (info) URL connection failed after 10 attempts. Exiting.`)
        success = true // pseudo success
        return false
      }

      ++attempts

      console.log(`[${topic}] (info) Checking up URL.`)
      await execa.command([
        `curl --fail ${url} --connect-timeout 2 --max-time 2 || exit 1`,
      ].join('\\'), {
        shell: true
      })

      success = true

      console.log(`[${topic}] (info) URL is UP.`)
    } catch (error) {
      if (error) {
        console.log(`[${topic}] (info) URL is DOWN.`)
        success = false
      }

      await new Promise(resolve => setTimeout(resolve, 10000))
    }
  }
  while (success === false)

  console.log(`[${topic}] (done) Check if URL is up.`)
  return true
}
