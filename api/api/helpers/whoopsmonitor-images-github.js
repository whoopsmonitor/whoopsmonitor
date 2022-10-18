const LIST_ENDPOINT = 'https://raw.githubusercontent.com/whoopsmonitor/image-indexer/master/dist/images.json'
const https = require('https')

module.exports = {

  friendlyName: 'Load available Whoops Monitor images from GitHub.',

  description: '',

  inputs: {
  },

  exits: {
    badRequest: {}
  },

  fn: async function (inputs, exits) {
    let rawData = ''

    https.get(LIST_ENDPOINT, {
      headers: {
        'user-agent': 'whoopsmonitor <https://github.com/whoopsmonitor>'
      }
    }, res => {
      res.on('data', chunk => {
        rawData += chunk
      })

      res.setEncoding('utf8')

      res.on('end', async () => {
        try {
          const results = JSON.parse(rawData)

          // remove all records first
          await WhoopsMonitorImages.destroy({})

          // insert new ones
          await WhoopsMonitorImages.createEach(results)

          sails.log('[whoopsmonitor-images-from-github] Done.')

          return exits.success(true)
        } catch (error) {
          sails.log.error(error)

          sails.log('[whoopsmonitor-images-from-github] Done, error.')
          return exits.badRequest()
        }
      })
    }).on('error', err => {
      sails.log.error(err)
      sails.log('[whoopsmonitor-images-from-github] Done, error.')
      return exits.badRequest()
    })
  }
}
