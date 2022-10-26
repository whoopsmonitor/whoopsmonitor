const tmpPath = sails.config.paths.tmp
const path = require('path')
const backupFolder = path.join(tmpPath, 'backup')
const fs = require('fs')

module.exports = {

  friendlyName: 'Remove a backup.',

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
    const backupDir = `${backupFolder}/${inputs.id}`
    try {
      if (!fs.existsSync(backupDir)) {
        return exits.badRequest()
      }

      fs.rmdirSync(backupDir, {
        recursive: true
      })

      return exits.success({
        id: inputs.id
      })
    } catch (error) {
      sails.log.error(error)
      return exits.badRequest()
    }
  }
}
