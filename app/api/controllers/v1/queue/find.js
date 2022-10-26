const JSend = require('jsend')

module.exports = {

  friendlyName: 'Count objects in the queue',

  inputs: {
    name: {
      type: 'string',
      required: true
    }
  },

  exits: {
    badRequest: {
      responseType: `badRequest`
    }
  },

  fn: async function (inputs, exits) {
    let queue = {}

    try {
      queue['count'] = await sails.hooks.bulljs[inputs.name].count()
    } catch (err) {
      if (err) {
        sails.log.error(`Queue ${inputs.name} not found.`)
      }

      queue['count'] = 0
    }

    return exits.success(JSend.success(queue))
  }
}
