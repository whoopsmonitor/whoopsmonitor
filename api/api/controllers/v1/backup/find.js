const JSend = require('jsend')
const tmpPath = sails.config.paths.tmp
const path = require('path')
const backupFolder = path.join(tmpPath, 'backup')
const fs = require('fs')

module.exports = {

  friendlyName: 'Find all backups',

  inputs: {
  },

  exits: {
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function (_, exits) {
    try {
      const folders = fs.readdirSync(backupFolder, {
        withFileTypes: true
      })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

      return exits.success(JSend.success(folders))
    } catch (error) {
      sails.log.error(error)
      return exits.badRequest()
    }
  }
}
