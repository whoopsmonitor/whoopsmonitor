module.exports = {
  friendlyName: 'Join realtime events.',
  inputs: {},
  exits: {
    badRequest: {
      responseType: 'badRequest'
    }
  },
  fn: async function (_, exits) {
    if (!this.req.isSocket) {
      return exits.badRequest()
    }

    // join room
    return sails.sockets.join(this.req, 'realtime', (err) => {
      if (err) {
        return exits.badRequest()
      }

      sails.log.info(`User joined 'realtime' events'.`)
    })
  }
}
