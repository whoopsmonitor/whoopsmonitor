var supertest = require('supertest')

describe('Index page', () => {
  it('should show status info', (done) => {
    supertest(sails.hooks.http.app)
      .post('/')
      .expect(200, {
        status: `success`,
        data: {
          db: true
        }
      }, done)
  })
})
