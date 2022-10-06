const LIST_ENDPOINT = 'https://raw.githubusercontent.com/whoopsmonitor/image-indexer/master/dist/images.json'
const https = require('https')
const NodeCache = require('node-cache')
const myCache = new NodeCache({
  stdTTL: 60 * 15 // stored for 15 minutes
})
const CACHE_KEY = 'docker.images'

module.exports = {
  friendlyName: 'List all images from GitHub.',

  inputs: {
  },

  exits: {
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function (_, exits) {
    let results = myCache.get(CACHE_KEY)

    if (results) {
      return exits.success(results)
    }

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

      res.on('end', () => {
        try {
          const output = JSON.parse(rawData)
          myCache.set(CACHE_KEY, output)
          return exits.success(output)
        } catch (error) {
          sails.log.error(error)
          return exits.badRequest()
        }
      })
    }).on('error', err => {
      sails.log.error(err)
      return exits.badRequest()
    })
  }
}
