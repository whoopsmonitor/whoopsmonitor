module.exports = {

  friendlyName: 'Install health index data.',

  description: '',

  inputs: {
  },

  exits: {
  },

  fn: async function (_, exits) {
    await HealthIndex.findOrCreate({
      option: 'warning',
      type: HealthIndex.TYPE_GLOBAL
    }, {
      option: 'warning',
      value: 90,
      hours: 24
    })

    await HealthIndex.findOrCreate({
      option: 'critical',
      type: HealthIndex.TYPE_GLOBAL
    }, {
      option: 'critical',
      value: 50,
      hours: 24
    })

    return exits.success(true)
  }
}
