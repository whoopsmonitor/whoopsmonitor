module.exports = {

  friendlyName: 'Login.',

  inputs: {
    password: {
      type: 'string',
      required: true
    }
  },

  exits: {
    unauthorized: {
      responseType: 'unauthorized'
    },
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ password }, exits) {
    if (password === process.env.APP_PASSWORD) {
      return exits.success(true)
    }

    return exits.unauthorized()
  }
}
