const crypto = require('crypto')

module.exports = {

  friendlyName: 'Random string',

  description: 'Generate random string',

  inputs: {
    count: {
      type: `number`,
      required: true
    }
  },

  exits: {
  },

  fn: async function (inputs, exits) {
    // it has to be divided by 2 to get a proper length
    return exits.success(
      crypto.randomBytes(inputs.count / 2).toString(`hex`)
    )
  }
}
