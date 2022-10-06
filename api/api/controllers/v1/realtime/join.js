const JSend = require('jsend')

module.exports = {
  friendlyName: 'Clean all records in specified queue, return number of records.',
  inputs: {},
  exits: {
    badRequest: {
      responseType: 'badRequest'
    }
  },
  fn: async function (inputs, exits) {
    // join room
    if (this.req.isSocket) {
      sails.sockets.join(this.req, 'realtime', (err) => {
        if (err) {
          return exits.badRequest()
        }

        sails.log(`User joined realtime events'.`)
      })
    }

    return exits.success(JSend.success(true))
  }
}
