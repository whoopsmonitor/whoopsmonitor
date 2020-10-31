var { ObjectId } = require('bson')

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
    let query = [
      {
        '$match': {
          'createdAt': {
            '$gte': from,
            '$lte': to
          }
        }
      },
      {
        '$group': {
          '_id': {
            '$dateToString': {
              'format': '%Y-%m-%d',
              'date': {
                '$toDate': '$createdAt'
              }
            }
          },
          'ok': {
            '$sum': {
              '$cond': {
                'if': {
                  '$eq': [
                    '$status', 0
                  ]
                },
                'then': 1,
                'else': 0
              }
            }
          },
          'warning': {
            '$sum': {
              '$cond': {
                'if': {
                  '$eq': [
                    '$status', 1
                  ]
                },
                'then': 1,
                'else': 0
              }
            }
          },
          'critical': {
            '$sum': {
              '$cond': {
                'if': {
                  '$eq': [
                    '$status', 2
                  ]
                },
                'then': 1,
                'else': 0
              }
            }
          }
        }
      }, {
        '$project': {
          '_id': 0,
          'date': '$_id',
          'ok': '$ok',
          'warning': '$warning',
          'critical': '$critical'
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

        return exits.success(results)
      })
  }
}
