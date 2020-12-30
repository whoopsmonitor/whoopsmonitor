const JSend = require('jsend')

module.exports = {

  friendlyName: 'Download a backup in ZIP.',

  inputs: {
    id: {
      type: 'string',
      required: true
    }
  },

  exits: {
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function (inputs, exits) {
    const filepath = await sails.helpers.prepareBackupFolder(inputs.id)

    try {
      this.res.attachment(`${inputs.id}.zip`)
      const downloading = await sails.startDownload(filepath)

      return exits.success(downloading)
    } catch (error) {
      sails.log.error(error)
      return exits.badRequest()
    }
  }
}
