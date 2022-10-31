const APP_NAME = process.env.APP_NAME

module.exports.cronjob = {
  updateCronjob: {
    schedule: '*/30 * * * * *',
    onTick: async function () {
      sails.log.info('[update-cron-jobs] Run cronjob to setup repeating jobs.')
      await sails.helpers.updateCronJobs()
    }
  },
  maintenance: {
    schedule: '0 0 * * *',
    onTick: async function () {
      sails.log.info('[cleaning-up-logs] Clean up old records in check status table.')
      await sails.helpers.cleanupOldCheckStatus()
      await sails.helpers.cleanupOldAlertStatus()
    }
  },
  realtimeIsFailing: {
    schedule: '*/30 * * * * *',
    onTick: async function () {
      sails.log.info('[realime-is-failing] Run cronjob to setup realtime events.')
      await sails.helpers.realtimeIsFailing()
    }
  },
  imagesGithub: {
    runOnInit: true,
    schedule: '*/30 * * * *',
    onTick: async function () {
      sails.log.info('[whoopsmonitor-images-from-github] Load Whoops Monitor images from GitHub.')
      await sails.helpers.whoopsmonitorImagesGithub()
    }
  },
  workerImageMetadata: {
    guard: async () => {
      return APP_NAME === 'worker-image-metadata'
    },
    runOnInit: true,
    on: 'hooks:builtIn:ready',
    schedule: '* * * * *',
    onTick: async function () {
      sails.log.info(`[${APP_NAME}] (START) Reloading docker images metadata.`)
      await sails.helpers.workerImageMetadata()
      sails.log.info(`[${APP_NAME}] (END) Reloading docker images metadata.`)
    }
  },
  workerAggregate: {
    guard: async () => {
      return APP_NAME === 'worker-aggregate'
    },
    runOnInit: true,
    on: 'hooks:builtIn:ready',
    schedule: '* * * * *',
    onTick: async function () {
      await sails.helpers.workerAggregate()
    }
  }
}
