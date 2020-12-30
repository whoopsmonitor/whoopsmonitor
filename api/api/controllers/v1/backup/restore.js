const JSend = require('jsend')

module.exports = {

  friendlyName: 'Restorre a backup',

  inputs: {
    id: {
      type: 'string',
      required: true
    }
  },

  exits: {
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function (inputs, exits) {
    let result = await sails.helpers.restoreBackup(inputs.id)

    return exits.success(JSend.success(result))
  }
}
