const execa = require('execa')

module.exports = {

  friendlyName: 'Update metadata of the docker image.',

  description: '',

  inputs: {
  },

  exits: {
    notFound: {},
    badRequest: {}
  },

  fn: async function (inputs, exits) {
    sails.log.info(`(START) Getting images from the API.`)

    try {
      const images = await DockerImage.find({})

      if (!images) {
        return exits.notFound()
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
            await DockerImage.updateOne({ id: image.id }).set({
              metadata,
              healthyStatus: 0,
              healthyStatusOutput: 'image is fine'
            })

            sails.log.info(`(END) Image's metadata (${image.image}) updated.`)
          } else {
            sails.log.info(`(END) Image's metadata (${image.image}) are the same. No need for update.`)
          }
        } catch (err) {
          sails.log.error(`(ERROR) Image's metadata (${image.image}) not updated due to error.`)
          sails.log.error(`More info: `, err)

          // issue with image, update the status
          if (err.exitCode > 0 && err.stderr) {
            await DockerImage.updateOne({ id: image.id }).set({
              healthyStatus: err.exitCode,
              healthyStatusOutput: err.stderr
            })
          }
        }
      }

      return exits.success()
    } catch (error) {
      sails.log.error(`(ERROR) Reloading docker images metadata - failed.`)
      sails.log.error(error)
      return exits.badRequest()
    }
  }
}
