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

  fn: async function (inputs, exits) {
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

    if (!db) {
      return exits.wrongStatus()
    }

    let queue = {
      check: 0,
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
      await sails.hooks.bull.statusQueue.add()
      queue.check = await sails.hooks.bull.executeCheck.count()
      queue.alerting = await sails.hooks.bull.alertingQueue.count()
      redis = true


    } catch (err) {
      if (err) {
        // do nothing
      }
      redis = false
    }

    let status = {
      overall,
      db,
      redis,
      queue
    }

    return exits.success(JSend.success(status))
  }
}
