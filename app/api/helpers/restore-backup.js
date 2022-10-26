const fs = require('fs')
const unzipper = require('unzipper')
const tmpPath = sails.config.paths.tmp
const restorePath = `${tmpPath}/restore`

module.exports = {

  friendlyName: 'Restore a backup.',

  description: '',

  inputs: {
    file: {
      type: 'ref',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Backup restored.'
    },
    fileArchiveError: {
      description: 'Not possible to unzip the file.'
    }
  },

  fn: async function (inputs, exits) {
    const file = inputs.file

    // delete restore dir in case it exists
    if (fs.existsSync(restorePath)) {
      fs.rmSync(restorePath, {
        recursive: true
      })

      // and create an empty dir again
      fs.mkdirSync(restorePath)
    }

    // unzip the file
    try {
      const d = await unzipper.Open.file(file.fd)
      await d.extract({ path: restorePath })

      const collections = sails.config.backup.collections

      for (const collection of collections) {
        sails.log(`[restore][?] Restoring collection: ${collection}`)

        const model = sails.models[collection]
        const content = fs.readFileSync(`${restorePath}/${collection}.json`).toString()

        if (!content) {
          sails.log(`[restore][!] No content specified for collection: ${collection}`)
          continue
        }

        // destroy model anyway
        await model.destroy({})

        const data = JSON.parse(content)

        if (!data.length) {
          sails.log(`[restore][!] No data specified for collection: ${collection}`)
          continue
        }

        await model.createEach(data)

        sails.log(`[restore][ok] Data for collection '${collection}' imported, ${data.length} records.`)
      }

      return exits.success(true)
    } catch (error) {
      if (error) {
        sails.log.error(error)
      }

      return exits.fileArchiveError()
    }
  }
}
