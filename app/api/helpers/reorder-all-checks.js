module.exports = {

  friendlyName: 'Reorder all checks.',

  description: '',

  inputs: {
  },

  exits: {
  },

  fn: async function (_, exits) {
    const items = await Check.find().sort('order')

    if (!items) {
      return exits.success(true)
    }

    let counter = 0
    for (const item of items) {
      try {
        await Check.update({
          id: item.id
        }, {
          order: counter
        })

        ++counter
      } catch (error) {
        if (error) {
          sails.log.error(error)
        }
      }
    }

    return exits.success(true)
  }
}
