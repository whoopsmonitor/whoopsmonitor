var { DateTime } = require('luxon')

module.exports = {

  friendlyName: 'Remove older check statuses.',

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
    const d1 = DateTime.local()
    const monthBefore = d1.minus({ month: inputs.month })

    try {
      let items = await CheckStatus.destroy({
        createdAt: {
          '<=': monthBefore.valueOf()
        }
      })

      if (items && items.length) {
        sails.log.info(`[clean-up-check-status] Removing older status records (${items.length}).`)
      } else {
        sails.log.info(`[clean-up-check-status] There are no older records to remove.`)
      }

      return exits.success(false)
    } catch (error) {
      if (error) {
        sails.log.error(error)
      }

      sails.log.info(`[clean-up-check-status] Removing older rows failed.`)
    }

    return exits.success(true)
  }
}
