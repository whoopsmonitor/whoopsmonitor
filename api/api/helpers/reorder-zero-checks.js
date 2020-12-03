module.exports = {

  friendlyName: 'Reorder checks in case there is a "O".',

  description: '',

  inputs: {
  },

  exits: {
  },

  fn: async function (_, exits) {
    const founded = await Check.find({
      order: 0
    }).limit(2) // search for at least 2 elements. "1" is actually ok.

    if (!founded) {
      return exits.success(true)
    }

    // we founded only one, that means the "first" which is ok
    if (founded.length === 1) {
      return exits.success(true)
    }

    await sails.helpers.reorderAllChecks()

    return exits.success(true)
  }
}
