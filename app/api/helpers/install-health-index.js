module.exports = {

  friendlyName: 'Install health index data.',

  description: '',

  inputs: {
  },

  exits: {
  },

  fn: async function (_, exits) {
    await HealthIndex.findOrCreate({
      check: null,
      option: 'warning',
      hours: 24
    }, {
      option: 'warning',
      value: 90,
      hours: 24
    })

    await HealthIndex.findOrCreate({
      check: null,
      option: 'critical',
      hours: 24
    }, {
      option: 'critical',
      value: 50,
      hours: 24
    })

    return exits.success(true)
  }
}
