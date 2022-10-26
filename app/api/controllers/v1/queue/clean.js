const JSend = require('jsend')

module.exports = {

  friendlyName: 'Clean all records in specified queue, return number of records.',

  inputs: {
    name: {
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
    let count = 0

    try {
      count = await sails.hooks.bulljs[inputs.name].count()
      await sails.hooks.bulljs[inputs.name].empty()
    } catch (err) {
      sails.log.error(err)
      return exits.badRequest()
    }

    return exits.success(JSend.success(count))
  }
}
