import { readFileSync } from 'fs'
import logSymbols from 'log-symbols'
import { execa } from 'execa'
import cron from 'node-cron'
import axios from 'axios'
import c from 'console-stamp'
const packageName = JSON.parse(readFileSync('package.json')).name
const APP_API_URL = process.env.APP_API_URL
const APP_TOKEN = process.env.APP_TOKEN

c(console)

const axiosInstance = axios.create({
  baseURL: APP_API_URL,
  timeout: 3000,
  headers: {
    'Authorization': `Bearer ${APP_TOKEN}`
  }
})

const updateDockerMetadata = async function () {
  console.log(`[${packageName}] [${logSymbols.info}] Getting images from the API.`)
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
        const { stdout } = await execa(commands.join('\\'), {
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

          console.log(`[${packageName}] [${logSymbols.success}] Image's metadata (${image.image}) updated.`)
        } else {
          console.log(`[${packageName}] [${logSymbols.success}] Image's metadata (${image.image}) are the same. No need for update.`)
        }
      } catch (err) {
        console.log(`[${packageName}] [${logSymbols.error}] Image's metadata (${image.image}) not updated due to error.`)
        console.error(`[${packageName}] More info: `, err)

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
    console.error(`[${packageName}] [${logSymbols.error}] Reloading docker images metadata - failed.`, `${err.code}`)
    // and silently die here, no place to report
  }

  return Promise.resolve()
}

;(async function main () {
  // run the process every minute
  cron.schedule('* * * * *', async () => {
    console.log(`[${packageName}] [${logSymbols.info}] Reloading docker images metadata - started.`)
    await updateDockerMetadata()
    console.log(`[${packageName}] [${logSymbols.info}] Reloading docker images metadata - done.`)
  })

  await updateDockerMetadata()
})()
