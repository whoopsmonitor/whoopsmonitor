var { ObjectId } = require('bson')
const NodeCache = require('node-cache')
const myCache = new NodeCache({
  stdTTL: 60 * 60 // stored for 60 minutes
})

module.exports = {

  friendlyName: 'Aggregate metric by day.',

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
    const cacheKey = `aggregate-metric-by-day.${checkId}-${from}-${to}`
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
          '_id': {
            '$dateToString': {
              'format': '%Y-%m-%d',
              'date': {
                '$toDate': '$createdAt'
              }
            }
          },
          'output': {
            '$avg': {
              '$convert': {
                'input': '$output',
                'to': 'double'
              }
            }
          }
        }
      }, {
        '$project': {
          '_id': 0,
          'date': '$_id',
          'output': {
            '$convert': {
              'input': '$output',
              'to': 'int'
            }
          }
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
