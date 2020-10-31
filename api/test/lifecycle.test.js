var sails = require('sails')
var mochaAsync = require('./helpers/async')

// Before running any tests...
before(function (done) {
  // Increase the Mocha timeout so that Sails has enough time to lift, even if you have a bunch of assets.
  this.timeout(10000)

  sails.lift({
    // Your Sails app's configuration files will be loaded automatically,
    // but you can also specify any other special overrides here for testing purposes.

    // For example, we might want to skip the Grunt hook,
    // and disable all logs except errors and warnings:
    hooks: { grunt: false },
    log: { level: 'warn' }

  }, (err, sails) => {
    if (err) { return done(err) }

    // here you can load fixtures, etc.
    // (for example, you might want to create some records in the database)

    return done(err, sails)
  })
})

// After all tests have finished...
after(mochaAsync(async (done) => {
  try {
    await Cluster.destroy({})
    await Node.destroy({})
    await Database.destroy({})
    await Configuration.destroy({}) // do not destroy configuration table. It is created only once.
  } catch (err) {
    if (err) {
      sails.log.error(err)
    }

    return done(err)
  }

  sails.lower(done)
}))
