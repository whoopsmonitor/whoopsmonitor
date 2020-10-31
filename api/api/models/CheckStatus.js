/**
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    check: {
      model: 'Check'
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
        check: 1
      }
    },
    {
      attributes: {
        status: 1
      }
    }
  ]
}
