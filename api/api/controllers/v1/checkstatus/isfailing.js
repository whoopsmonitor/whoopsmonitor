var { ObjectId } = require('bson')

module.exports = {

  friendlyName: 'Info if some check is failing at this time.',

  inputs: {
  },

  exits: {
  },

  fn: async function (_, exits) {
    const checks = await Check.find({
      select: 'id',
      where: {
        enabled: true
      }
    })

    let isFailing = false

    for (let check of checks) {
      let results = await CheckStatus.find({
        where: {
          check: check.id
        },
        sort: 'createdAt desc',
        select: ['id', 'status'],
        limit: 1
      })

      if (results.length) {
        if (results[0].status > 0) {
          isFailing = true
          break
        }
      }
    }

    return exits.success(isFailing)
  }
}
