const NodeCache = require('node-cache')
const myCache = new NodeCache({
  stdTTL: 60 * 1 // stored for 1 minute
})

module.exports = {

  friendlyName: '',

  inputs: {
    select: {
      type: 'string'
    },
    where: {
      type: 'string'
    },
    sort: {
      type: 'string'
    },
    limit: {
      type: 'number',
      defaultsTo: 10
    }
  },

  exits: {
  },

  fn: async function (inputs, exits) {
    try {
      const options = {}

      if (inputs.select) {
        options.select = inputs.select.split(',')
      }

      if (inputs.where) {
        options.where = JSON.parse(inputs.where)
      }

      if (inputs.sort) {
        options.sort = inputs.sort
      }

      if (!Object.keys(options).length) {
        return exits.success([])
      }

      const cacheKey = `checkstatus.${JSON.stringify(options)}`
      const cachedResults = myCache.get(cacheKey)

      if (cachedResults) {
        return exits.success(cachedResults)
      }

      let results = await CheckStatus.find(options).limit(inputs.limit)

      myCache.set(cacheKey, results)

      return exits.success(results)
    } catch (error) {
      if (error) {
        sails.log.error(error)
      }

      return exits.success([])
    }
  }
}
