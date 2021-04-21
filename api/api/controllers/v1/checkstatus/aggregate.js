var { ObjectId } = require('bson')
const NodeCache = require('node-cache')
const myCache = new NodeCache({
  stdTTL: 60 * 15 // stored for 15 minutes
})

module.exports = {

  friendlyName: 'Aggregate checks.',

  inputs: {
    checkId: {
      type: 'string'
    },
    from: {
      type: 'number',
      required: true
    },
    to: {
      type: 'number',
      required: true
    }
  },

  exits: {
  },

  fn: async function ({ checkId, from, to }, exits) {
    const cacheKey = `aggregate.${checkId}-${from}-${to}`
    const cachedResults = myCache.get(cacheKey)

    if (cachedResults) {
      return exits.success(cachedResults)
    }

    let query = [
      {
        '$match': {
          'createdAt': {
            '$gte': from,
            '$lte': to
          }
        }
      }, {
        '$group': {
          '_id': '$status',
          'total': {
            '$sum': 1
          }
        }
      }, {
        '$project': {
          '_id': 0,
          'status': '$_id',
          'total': 1
        }
      }
    ]

    try {
      if (checkId) {
        for (const queryKey in query) {
          if (query[queryKey].hasOwnProperty('$match')) {
            query[queryKey].$match['check'] = new ObjectId(checkId)
          }
        }
      }
    } catch (error) {
      sails.log.error(error)
      return exits.success([])
    }

    await CheckStatus
      .getDatastore()
      .manager
      .collection(CheckStatus.tableName)
      .aggregate(query).toArray((err, results) => {
        if (err) {
          sails.log.error(err)
          return exits.success([])
        }

        myCache.set(cacheKey, results)

        return exits.success(results)
      })
  }
}
