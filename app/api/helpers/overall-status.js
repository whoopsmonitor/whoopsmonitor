const parser = require('cron-parser')
const { DateTime, Settings } = require('luxon')
Settings.defaultZoneName = 'utc'

module.exports = {

  friendlyName: 'Overall status for the app.',

  description: '',

  inputs: {
  },

  exits: {
  },

  fn: async function (inputs, exits) {
    let overall = {
      issues: 0,
      output: []
    }

    try {
      // find unhealthy images
      const images = await DockerImage.find({
        where: {
          healthyStatus: {
            '>': 0
          },
        },
        select: ['image', 'healthyStatusOutput'],
      })

      if (images.length) {
        ++overall.issues

        for (const image of images) {
          overall.output.push(`Image '${image.image}' corrupted. Error: ${image.healthyStatusOutput}`)
        }
      }

      // find last statuses that are older then the cron
      const checks = await Check.find({
        where: {
          enabled: true
        },
        select: ['name', 'cron']
      })

      if (checks.length) {
        for (const check of checks) {
          const cron = parser.parseExpression(check.cron)
          const lastRunShouldStartDatetimeTime = DateTime.fromISO(cron.prev().toISOString()).minus(5, 'minutes') // adding 5 minutes default

          // find last status
          let checkStatus = await CheckStatus.find({
            where: {
              check: check.id
            },
            select: ['createdAt', 'duration'],
            limit: 1,
            sort: 'createdAt DESC'
          })

          if (checkStatus.length) {
            checkStatus = checkStatus[0]

            // get where the check has been created but + duration as well
            const didRunDateTime = DateTime.fromMillis(checkStatus.createdAt).plus(checkStatus.duration, 'ms')

            // check is late for some reason
            if (lastRunShouldStartDatetimeTime >= didRunDateTime) {
              ++overall.issues
              overall.output.push(`Check "${check.name}" is in delay, last run [${didRunDateTime.toString()}], cron [${check.cron}].`)
            }
          }
        }
      }
    } catch (error) {
      if (error) {
        sails.log.error(error)
        // error is not interesting here
      }

      // something is cardinally wrong
      overall.issues = 1000
      overall.output.push('Internal Server Error.')
    }


    return exits.success(overall)
  }
}
