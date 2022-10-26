const JSend = require('jsend')

module.exports = {

  friendlyName: 'Index',

  description: 'Index page.',

  inputs: {},

  exits: {
    wrongStatus: {
      responseType: `wrongStatus`
    }
  },

  fn: async function (_, exits) {
    let hasError = false
    let db = false
    let redis = false

    try {
      await Configuration.find({})
      db = true
    } catch (err) {
      if (err) {
        // do nothing
      }
    }

    // if not connection to DB available, there is no need to search for other errors
    if (!db) {
      return exits.wrongStatus()
    }

    let queue = {
      worker: 0,
      alerting: 0
    }

    let overall = {}

    try {
      overall = await sails.helpers.overallStatus()
    } catch (error) {
      if (error) {
        // do nothing here
      }
    }

    try {
      await sails.hooks.bulljs.status.add() // only for "stats" purpose
      queue.worker = await sails.hooks.bulljs.worker.count()
      queue.alerting = await sails.hooks.bulljs.alerting.count()
      redis = true
    } catch (err) {
      if (err) {
        // do nothing
      }
      redis = false
      hasError = true
    }

    let status = {
      overall,
      db,
      redis,
      queue
    }

    if (hasError) {
      return exits.wrongStatus(status)
    }

    return exits.success(JSend.success(status))
  }
}
