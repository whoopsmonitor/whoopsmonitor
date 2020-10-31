module.exports = {

  friendlyName: 'Login.',

  inputs: {
    password: {
      type: 'string',
      required: true
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function ({ password }, exits) {
    if (password === process.env.APP_PASSWORD) {
      return exits.success()
    }

    return exits.notFound()
  }
}
