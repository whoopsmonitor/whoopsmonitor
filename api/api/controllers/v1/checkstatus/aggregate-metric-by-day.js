var { ObjectId } = require('bson')

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

        return exits.success(results)
      })
  }
}
