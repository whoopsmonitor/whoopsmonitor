const IMAGE = 'ghcr.io/whoopsmonitor/whoopsmonitor-check-url-alive:1.0'

module.exports = {
  friendlyName: 'Install demo data.',

  inputs: {
  },

  exits: {
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function (_, exits) {
    try {
      // remove an image first if exists
      await DockerImage.destroy({
        image: IMAGE
      })

      // create an image
      const image = await DockerImage.create({
        image: IMAGE
      }).meta({
        fetch: true
      })

      // create a check that pings Google
      await Check.create({
        enabled: true,
        name: 'ping google',
        image: image.id,
        cron: '* * * * *',
        environmentVariables: {
          WM_ENDPOINT_URL: 'https://www.google.com'
        }
      })
    } catch (error) {
      sails.log.error(error)

      return exits.badRequest()
    }

    return exits.success({})
  }
}
