/**
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    key: {
      type: 'string',
      required: true
    },
    value: {
      type: 'string',
      required: true,
      encrypt: true
    },
    check: {
      model: 'Check'
    },
    alert: {
      model: 'Alert'
    }
  },

  customToJSON: function () {
    // encrypt env vars
    if (this.value) {
      this.value = sails.helpers.decryptAttribute(this.value)
    }

    return this
  }
}
