module.exports = {

  friendlyName: 'Realtime - Info if some check is failing at this time.',

  description: '',

  inputs: {
    month: {
      type: 'number',
      defaultsTo: 1
    }
  },

  exits: {
  },

  fn: async function (inputs, exits) {
    sails.log.info(`[realtime-is-failing] Start.`)

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

    sails.log.info(`[realtime-is-failing] Broadcasting "isfailing" event with status: ${isFailing}`)
    sails.sockets.broadcast('realtime', 'isfailing', {
      isFailing
    })

    sails.log.info(`[realtime-is-failing] Done.`)

    return exits.success(isFailing)
  }
}
