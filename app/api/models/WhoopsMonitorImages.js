/**
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    type: {
      type: 'string',
      required: true
    },
    label: {
      type: 'string',
      required: true
    },
    value: {
      type: 'string',
      required: true
    },
    icon: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string'
    }
  }
}
