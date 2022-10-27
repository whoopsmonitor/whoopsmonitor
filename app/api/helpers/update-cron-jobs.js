module.exports = {

  friendlyName: 'Update cron jobs',

  description: '',

  inputs: {
  },

  exits: {
  },

  fn: async function (inputs, exits) {
    // find all checks
    let checks = await Check.find({
      enabled: true
    }).decrypt()

    if (!checks.length) {
      sails.log.info('[update-cron-jobs] There are no queues to create.')
      return exits.success(true)
    }

    for (let check of checks) {
      try {
        // find Docker image as well
        let dockerImage = await DockerImage.findOne({
          id: check.image
        })

        check.image = dockerImage

        if (!check.cron && !check.every) {
          sails.log.info(`[update-cron-jobs][${check.id}] Check "${check.name}" does not have an interval configured.`)
          return exits.success(false)
        }

        let repeat = {
          cron: check.cron || '* * * * *' // default is 1 minute
        }

        try {
          await sails.hooks.bulljs.worker.add({
            checkId: check.id,
            cron: check.cron,
            environmentVariables: JSON.stringify(check.environmentVariables)
          }, {
            jobId: check.id,
            repeat
          })
        } catch (error) {
          if (error) {
            sails.log.error(error)
          }

          return exits.success(false)
        }

        if (check.cron) {
          sails.log.info(`[update-cron-jobs][${check.id}] Check "${check.name}" registered with cronjob "${check.cron}".`)
        } else {
          sails.log.info(`[update-cron-jobs][${check.id}] Check "${check.name}" registered with interval "${check.every}" ms.`)
        }
      } catch (err) {
        if (err) {
          sails.log.error(err)
        }

        return exits.success(false)
      }
    }

    return exits.success(true)
  }
}
