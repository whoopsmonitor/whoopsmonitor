const JSend = require('jsend')

module.exports = {

  friendlyName: 'Create a new backup',

  inputs: {
  },

  exits: {
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function (_, exits) {
    try {
      await sails.helpers.createBackup()
    } catch (error) {
      sails.log.error(error)
      return exits.badRequest()
    }

    return exits.success(JSend.success(true))
  }
}
