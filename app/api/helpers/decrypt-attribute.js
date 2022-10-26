var EA = require('encrypted-attr')

module.exports = {

  friendlyName: 'Decrypt attributes',

  description: '',

  inputs: {
    value: {
      type: 'ref', // type "string" does not work correctly
      required: true
    }
  },

  exits: {
    decryptError: {
      description: 'Empty result when decrypted.'
    }
  },

  sync: true,

  fn: function ({ value }, exits) {
    try {
      const result = EA(null, {
        keys: sails.config.models.dataEncryptionKeys
      }).decryptAttribute(undefined, value)

      if (result) {
        // result is a string, so try to parse it as JSON
        if (typeof result === 'string') {
          try {
            return exits.success(JSON.parse(result))
          } catch (err) {
            if (err) {
              // nothing to do
            }

            // decrypted value is not a JSON but probably a string
            return exits.success(result)
          }
        }

        // already an object
        if (typeof result === 'object') {
          return exits.success(result)
        }
      }

      return exits.decryptError()
    } catch (err) {
      console.error(err)
      return exits.decryptError()
    }
  }
}
