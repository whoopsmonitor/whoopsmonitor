const JSend = require('jsend')

module.exports = {

  friendlyName: 'Restore a backup',

  inputs: {
    id: {
      type: 'string',
      required: true
    }
  },

  exits: {
    badRequest: {
      responseType: 'badRequest'
    },
    fileUploadError: {
      responseType: 'badRequest'
    },
    restoreFailed: {
      responseType: 'badRequest'
    }
  },

  fn: async function (inputs, exits) {
    this.req.file('backup').upload(async (err, files) => {
      if (err) {
        return exits.fileUploadError()
      }

      if (!files.length) {
        return exits.fileUploadError()
      }

      const file = files[0]

      // just make sure we talk about ZIP
      if (file.type !== 'application/zip') {
        return exits.fileUploadError()
      }

      const result = await sails.helpers.restoreBackup(file)

      if (result !== true) {
        return exits.restoreFailed()
      }

      return exits.success(JSend.success(true))
    })
  }
}
