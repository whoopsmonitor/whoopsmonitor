var { ObjectId } = require('bson')

module.exports = {

  friendlyName: 'Aggregate by day, specified by "from" and "to" date ranges.',

  description: '',

  inputs: {
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
    failed: {}
  },

  fn: async function ({ from, to }, exits) {
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
      sails.log.info('(START) Gathering all checks.')
      const checks = await Check.find({})
      sails.log.info('(DONE) Gathering all checks.')

      for (const check of checks) {
        const checkId = check.id
        const checkName = check.name

        sails.log.info(`(START) Aggregating data for check "${checkName}.`)

        for (const queryKey in query) {
          if (query[queryKey].hasOwnProperty('$match')) {
            query[queryKey].$match['check'] = new ObjectId(checkId)
          }
        }

        await CheckStatus
          .getDatastore()
          .manager
          .collection(CheckStatus.tableName)
          .aggregate(query).toArray(async (err, results) => {
            if (err) {
              sails.log.error(err)
              return exits.failed()
            }

            sails.log.info(`(START) Update stats in DB for check "${checkName}".`)

            for (const result of results) {
              result.check = checkId

              await AggregateDaily.destroy({
                date: result.date,
                check: checkId
              })

              await AggregateDaily.create(result).tolerate('E_UNIQUE')
            }

            sails.log.info(`(DONE) Update stats in DB for check "${checkName}".`)
          })

        sails.log.info(`(DONE) Aggregating data for check "${checkName}".`)
      }
    } catch (error) {
      sails.log.error(error)
      return exits.failed()
    }
  }
}
