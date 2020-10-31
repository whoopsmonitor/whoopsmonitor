const JSend = require('jsend')

module.exports = {

  friendlyName: 'Clean all records in all queues.',

  inputs: {
  },

  exits: {
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function (_, exits) {
    const status = []

    try {
      const checkCount = await sails.hooks.bull.executeCheck.count()
      const alertingCount = await sails.hooks.bull.alertingQueue.count()

      await sails.hooks.bull.executeCheck.empty()
      await sails.hooks.bull.alertingQueue.empty()

      status.push(`Deleted ${checkCount} records from the check queue.`)
      status.push(`Deleted ${alertingCount} records from the alerting queue.`)
    } catch (err) {
      sails.log.error(err)
      return exits.badRequest()
    }

    return exits.success(JSend.success(status))
  }
}
