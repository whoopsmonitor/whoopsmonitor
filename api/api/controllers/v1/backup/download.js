const JSend = require('jsend')

module.exports = {

  friendlyName: 'Download a backup in ZIP.',

  inputs: {
    id: {
      type: 'string',
      required: true
    },
    download: {
      type: 'boolean',
      defaultsTo: false
    }
  },

  exits: {
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function (inputs, exits) {
    const filepath = await sails.helpers.prepareBackupFolder(inputs.id)

    if (inputs.download) {
      try {
        this.res.attachment()
        const downloading = await sails.startDownload(filepath)

        return exits.success(downloading)
      } catch (error) {
        sails.log.error(error)
        return exits.badRequest()
      }
    } else {
      return exits.success(filepath)
    }
  }
}
