/**
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    check: {
      model: 'Check'
    },
    date: {
      type: 'string',
      columnType: 'datetime',
      required: true,
      unique: true
    },

    ok: {
      type: `number`,
      required: true
    },

    warning: {
      type: `number`,
      required: true
    },

    critical: {
      type: `number`,
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
        day: 1
      }
    }
  ]
}
