const JSend = require('jsend')
const { DateTime } = require('luxon')

module.exports = {

  friendlyName: 'Aggregate checks.',

  inputs: {
    check: {
      type: 'string'
    },
    from: {
      type: 'number',
      required: true
    },
    to: {
      type: 'number',
      required: true
    }
  },

  exits: {
  },

  fn: async function (inputs, exits) {
    const results = await AggregateDaily.find({
      check: inputs.check,
      date: {
        '>=': DateTime.fromMillis(inputs.from).toFormat('yyyy-MM-dd'),
        '<=': DateTime.fromMillis(inputs.to).toFormat('yyyy-MM-dd')
      }
    })

    return exits.success(JSend.success(results))
  }
}
