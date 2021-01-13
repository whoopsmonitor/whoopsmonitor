var { DateTime } = require('luxon')

module.exports = {

  friendlyName: 'Add a check to the queue immediately.',

  description: '',

  inputs: {
    id: {
      type: 'string',
      required: true
    }
  },

  exits: {
    notFound: {
      description: 'Check does not exists.'
    },
    addToQueueFailed: {
      description: 'Adding to queue failed'
    }
  },

  fn: async function (inputs, exits) {
    // find check first
    let check = await Check.findOne({
      id: inputs.id
    }).decrypt()

    if (!check) {
      return exits.notFound()
    }

    // add to queue
    try {
      await sails.hooks.bull.executeCheck.add({
        checkId: check.id,
        cron: check.cron,
        environmentVariables: JSON.stringify(check.environmentVariables),
        immediate: true
      })

    } catch (error) {
      if (error) {
        sails.log.error(error)
      }

      return exits.addToQueueFailed()
    }

    return exits.success()
  }
}
