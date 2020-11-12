require( 'console-stamp' )( console )
const fs = require('fs')
const cron = require('node-cron')

/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also do this by creating a hook.
 *
 * For more information on bootstrapping your app, check out:
 * https://sailsjs.com/config/bootstrap
 */

module.exports.bootstrap = async function (done) {
  // By convention, this is a good place to set up fake data during development.
  //
  // For example:
  // ```
  // // Set up fake development data (or if we already have some, avast)
  // if (await User.count() > 0) {
  //   return done();
  // }
  //
  // await User.createEach([
  //   { emailAddress: 'ry@example.com', fullName: 'Ryan Dahl', },
  //   { emailAddress: 'rachael@example.com', fullName: 'Rachael Shaw', },
  //   // etc.
  // ]);
  // ```

  if (!await sails.helpers.isInstalled()) {
    await sails.helpers.generateSecurityKey()

    // create a temporary folder if not exists

    if (!fs.existsSync(sails.config.paths.public)) {
      fs.mkdirSync(sails.config.paths.public, {
        recursive: true
      })
    }

    await sails.helpers.markInstalled()
  }

  // scan for all cronjobs in every 30 seconds
  cron.schedule('0 0 * * *', async () => {
    sails.log('[cleaning-up-logs] Clean up old records in check status table.')
    await sails.helpers.cleanupOldCheckStatus()
    await sails.helpers.cleanupOldAlertStatus()
  })

  // scan for all cronjobs in every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    sails.log('[update-cron-jobs] Run cronjob to setup repeating jobs.')
    await sails.helpers.updateCronJobs()
  })

  // install health index data
  await sails.helpers.installHealthIndex()

  // Don't forget to trigger `done()` when this bootstrap function's logic is finished.
  // (otherwise your server will never lift, since it's waiting on the bootstrap)
  return done()
}
