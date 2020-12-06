module.exports = {

  friendlyName: 'Restore a backup.',

  description: '',

  inputs: {
    id: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Backup restored.'
    }
  },

  fn: async function (inputs, exits) {
    return exits.success({
      id: inputs.id
    })
  }
}
