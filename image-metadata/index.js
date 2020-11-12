require( 'console-stamp' )( console )
const execa = require('execa')
const cron = require('node-cron')
const axios = require('axios')
const logSymbols = require('log-symbols')
const API_URL = process.env.API_URL
const APP_TOKEN = process.env.APP_TOKEN

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 3000,
  headers: {
    'Authorization': `Bearer ${APP_TOKEN}`
  }
})

updateDockerMetadata = async function() {
  console.log(`[${logSymbols.info}][image-metadata] Getting images from the API.`)
  try {
    const images = await axiosInstance.get('/v1/dockerimage').then(response => response.data)

    if (!images) {
      return true
    }

    for (const image of images) {
      const commands = []
      let imageRegistry = image.image.split('/')[0]

      if (image.local === false) {
        if (image.username && image.password) {
          commands.push(`echo "${image.password}" | docker login ${imageRegistry} --username ${image.username} --password-stdin >/dev/null &&`)
        }

        commands.push(`docker pull ${image.image} >/dev/null &&`)
      }

      commands.push(`docker inspect ${image.image} | jq -r '.[0].Config.Labels'`)

      try {
        const { stdout } = await execa.command(commands.join('\\'), {
          shell: true
        })

        let metadata = {}
        const labels = JSON.parse(stdout)

        for (let labelKey in labels) {
          // filter env props
          if (labelKey.indexOf('com.whoopsmonitor') > -1) {
            metadata[labelKey] = labels[labelKey]
          }
        }

        if (metadata) {
          metadata = JSON.stringify(metadata)
        }

        // patch metadata in case the image is not correct or the metadata are different
        if ((image.healthyStatus === -1 || image.healthyStatus > 0) || metadata !== image.metadata) {
          await axiosInstance.patch(`/v1/dockerimage/${image.id}`, {
            metadata,
            healthyStatus: 0,
            healthyStatusOutput: 'image is fine'
          })

          console.log(`[${logSymbols.success}][image-metadata] Image's metadata (${image.image}) updated.`)
        } else {
          console.log(`[${logSymbols.success}][image-metadata] Image's metadata (${image.image}) are the same. No need for update.`)
        }
      } catch (err) {
        console.log(`[${logSymbols.error}][image-metadata] Image's metadata (${image.image}) not updated due to error.`)
        console.error('More info: ', err)

        // issue with image, update the status
        if (err.exitCode > 0 && err.stderr) {
          await axiosInstance.patch(`/v1/dockerimage/${image.id}`, {
            healthyStatus: err.exitCode,
            healthyStatusOutput: err.stderr
          })
        }
      }
    }
  } catch (err) {
    console.error(`[${logSymbols.error}][image-metadata] Reloading docker images metadata - failed.`, `${err.code}`)
    // and silently die here, no place to report
  }

  return Promise.resolve()
}

;(async function main() {
  // run the process every minute
  cron.schedule('* * * * *', async () => {
    console.log(`[${logSymbols.info}][image-metadata] Reloading docker images metadata - started.`)
    await updateDockerMetadata()
    console.log(`[${logSymbols.info}][image-metadata] Reloading docker images metadata - done.`)
  })

  await updateDockerMetadata()
})()
