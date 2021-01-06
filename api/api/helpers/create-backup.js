const { DateTime } = require('luxon')
const fs = require('fs')
const path = require('path')
const tmpPath = sails.config.paths.tmp
const backupFolder = path.join(tmpPath, 'backup')

module.exports = {

  friendlyName: 'Create a backup.',

  description: '',

  inputs: {
  },

  exits: {
    success: {
      description: 'Backup created.'
    },
    createBackupDir: {
      description: 'Not possible to create a backup dir.'
    },
    backupFolderAlreadyExits: {
      description: 'Folder with backup already exists in the file structure.'
    },
    createBackupFolderFailed: {
      description: 'It is not possible to create a backup folder.'
    },
    collectionFindFailed: {
      description: 'Not possible to find all records in the collection.'
    },
    backupFileWriteFailed: {
      description: 'It is not possible to write a specific collection with JSON data into the file.'
    }
  },

  fn: async function (_, exits) {
    const currentTime = DateTime.local().toISO()
    const backupLocation = path.join(backupFolder, currentTime)

    // check for "backup dir"
    try {
      if (!fs.existsSync(backupFolder)) {
        fs.mkdirSync(backupFolder)
      }
    } catch (error) {
      sails.log.error(error)
      throw 'createBackupDir'
    }

    if (fs.existsSync(backupLocation)) {
      throw 'backupFolderAlreadyExits'
    }

    // create a folder first
    try {
      fs.mkdirSync(backupLocation)
    } catch (error) {
      console.error(error)
      throw 'createBackupFolderFailed'
    }

    const collections = sails.config.backup.collections

    for (const collection of collections) {
      const model = sails.models[collection]
      const results = []

      try {
        results.concat(await model.find({}))
      } catch (error) {
        sails.log.error(error)
        throw 'collectionFindFailed'
      }

      try {
        fs.writeFileSync(`${backupLocation}/${collection}.json`, JSON.stringify(results))
      } catch (error) {
        sails.log.error(error)
        throw 'backupFileWriteFailed'
      }
    }

    return exits.success(true)
  }
}
