const fs = require('fs')
const path = require('path')
const tmpPath = sails.config.paths.tmp
const backupFolder = path.join(tmpPath, 'backup')
const downloadFolder = path.join(tmpPath, 'download')
const archiver = require('archiver')

module.exports = {

  friendlyName: 'Prepare a folder with the backup.',

  description: '',

  inputs: {
    id: {
      type: 'string',
      required: true
    }
  },

  exits: {
    backupFolderNotFound: {
      description: 'Folder with backup does not exists.'
    },
    downloadFolderCreateFailed: {
      description: 'Not possible to create a download folder.'
    }
  },

  fn: async function (inputs, exits) {
    const dirWithBackup = path.join(backupFolder, inputs.id)
    const zipFileName = `${inputs.id}.zip`
    const downloadedBackupFile = path.join(downloadFolder, zipFileName)

    if (!fs.existsSync(downloadFolder)) {
      try {
        fs.mkdirSync(downloadFolder)
      } catch (error) {
        sails.log.error(error)
        throw 'downloadFolderCreateFailed'
      }
    } else {
      return exits.success(downloadedBackupFile)
    }

    if (!fs.existsSync(dirWithBackup)) {
      throw 'backupFolderNotFound'
    }

    const output = fs.createWriteStream(downloadedBackupFile)
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    archive.pipe(output)

    archive.directory(`${backupFolder}/${inputs.id}`, false)

    archive.on('warning', function(err) {
      sails.log.error(err)
      throw err
    });

    archive.on('error', function (err) {
      sails.log.error(err)
      throw err
    })

    archive.finalize()

    return exits.success(downloadedBackupFile)
  }
}
