const bootstrap = require('../../../config/bootstrap')

describe('Bootstrap Config', () => {
  it(`loads correctly`, (done) => {
    bootstrap.bootstrap(done)
  })
})
