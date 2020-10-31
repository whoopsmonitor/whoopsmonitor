/**
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    alert: {
      model: 'Alert',
      required: true
    },
    status: {
      type: 'number',
      required: true
    },
    output: {
      type: 'string'
    },
    duration: {
      type: 'number',
      required: true
    }
  },
  indexes: [
    {
      attributes: {
        alert: 1
      }
    },
    {
      attributes: {
        status: 1
      }
    }
  ]
}
