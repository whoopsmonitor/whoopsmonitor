const { DateTime } = require('luxon')

module.exports = {

  friendlyName: 'Worker for aggregating data.',

  description: '',

  inputs: {
  },

  exits: {
    badRequest: {}
  },

  fn: async function (inputs, exits) {
    const date = DateTime.local()

    const startOfDay = date.minus({ days: 1 }).startOf('day').valueOf()
    const endOfDay = date.endOf('day').valueOf()

    sails.log.info('(START) Aggregating check results day ago.')
    await sails.helpers.aggregateByDay(startOfDay, endOfDay)
    sails.log.info('(DONE) Aggregating check results day ago.')

    return exits.success()
  }
}
