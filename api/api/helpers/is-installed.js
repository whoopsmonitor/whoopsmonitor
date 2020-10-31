module.exports = {

  friendlyName: 'Check if the app is installed',

  description: '',

  inputs: {
  },

  exits: {
  },

  fn: async function (inputs, exits) {
    try {
      let result = await Configuration.findOne({
        option: 'installed'
      }).decrypt()

      if (result) {
        return exits.success(result.value === '1') // configuration is a string
      }
    } catch (err) {
      if (err) {
        sails.log.error(err)
      }
    }

    return exits.success(false)
  }
}
