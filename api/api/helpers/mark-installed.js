module.exports = {

  friendlyName: 'Mark app as installed',

  description: '',

  inputs: {
  },

  exits: {
  },

  fn: async function (inputs, exits) {
    try {
      await Configuration.findOrCreate({
        option: 'installed'
      }, {
        option: 'installed',
        value: 1
      })

      return exits.success(true)
    } catch (err) {
      if (err) {
        sails.log.error(err)
      }
    }

    return exits.success(false)
  }
}
