module.exports = {

  friendlyName: 'Run check immediately.',

  inputs: {
    id: {
      type: 'string',
      required: true
    }
  },

  exits: {
    failed: {
      description: 'Not possible to run the check on demand.',
      responseType: 'badRequest'
    }
  },

  fn: async function (inputs, exits) {
    try {
      await sails.helpers.runCheckById(inputs.id)
    } catch (error) {
      sails.log.error(error)
      return exits.failed()
    }

    return exits.success(true)
  }
}
