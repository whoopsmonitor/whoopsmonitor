var EA = require('encrypted-attr')

module.exports = {

  friendlyName: 'Decrypt attributes',

  description: '',

  inputs: {
    value: {
      type: 'string',
      required: true
    }
  },

  exits: {
  },

  sync: true,

  fn: function ({ value }, exits) {
    try {
      const result = JSON.parse(EA(null, {
        keys: sails.config.models.dataEncryptionKeys
      }).decryptAttribute(undefined, value))

      // output is JSON
      return exits.success(result)
    } catch (_) {
      return exits.success(false)
    }
  }
}
