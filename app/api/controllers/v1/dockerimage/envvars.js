module.exports = {
  friendlyName: 'Get metadata vars from image.',

  inputs: {
    id: {
      type: 'string',
      required: true
    }
  },

  exits: {
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ id }, exits) {
    // find image first
    try {
      let image = await DockerImage.findOne({
        id
      })

      const newLabels = {}

      if (image.metadata) {
        const metadata = JSON.parse(image.metadata || {})

        if (Object.keys(metadata)) {
          for (const metaKey in metadata) {
            if (metaKey.indexOf('com.whoopsmonitor.env.') > -1) {
              newLabels[metaKey.replace('com.whoopsmonitor.env.', '')] = metadata[metaKey]
            }
          }
        }
      }

      return exits.success(newLabels)
    } catch (error) {
      sails.log.error(error)
      return exits.badRequest()
    }
  }
}
