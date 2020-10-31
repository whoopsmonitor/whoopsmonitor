module.exports = {

  friendlyName: 'Install health index data.',

  description: '',

  inputs: {
  },

  exits: {
  },

  fn: async function (_, exits) {
    await HealthIndex.findOrCreate({
      option: 'warning'
    }, {
      option: 'warning',
      value: 90
    })

    await HealthIndex.findOrCreate({
      option: 'critical'
    }, {
      option: 'critical',
      value: 50
    })

    return exits.success(true)
  }
}
