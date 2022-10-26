module.exports = {

  friendlyName: 'Change order for all checks.',

  inputs: {
  },

  exits: {
  },

  fn: async function (_, exits) {
    await sails.helpers.reorderAllChecks()
    return exits.success(true)
  }
}
