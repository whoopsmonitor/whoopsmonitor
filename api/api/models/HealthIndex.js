/**
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    option: {
      type: 'string',
      required: true
    },
    value: {
      type: 'number',
      required: true
    },
    hours: {
      type: 'number',
      required: true
    },
    check: {
      model: 'Check'
    }
  }
}
