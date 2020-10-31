/**
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    option: {
      type: 'string',
      required: true,
      unique: true
    },

    value: {
      type: `string`,
      required: true,
      encrypt: true
    }
  }
}
