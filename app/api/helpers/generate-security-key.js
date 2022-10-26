module.exports = {

  friendlyName: 'Generate a secure key',

  description: '',

  inputs: {
    count: {
      type: `number`,
      defaultsTo: 32
    }
  },

  exits: {
  },

  fn: async function (inputs, exits) {
    // create 32 length key for cyphering in case it does not exists yet
    try {
      let secureKey = await sails.helpers.random(inputs.count)
      await Configuration.findOrCreate({
        option: `encryption_key`
      }, {
        option: `encryption_key`,
        value: secureKey
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
