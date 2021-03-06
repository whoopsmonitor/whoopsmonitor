const sinon = require('sinon')

const responsesToTest = {
  alreadyExists: require('../../../api/api/responses/alreadyExists'),
  clusterHasNodes: require('../../../api/api/responses/clusterHasNodes'),
  clusterNotFound: require('../../../api/api/responses/clusterNotFound'),
  nodeNotFound: require('../../../api/api/responses/nodeNotFound'),
  noNodesInCluster: require('../../../api/api/responses/noNodesInCluster'),
  noPrimaryInCluster: require('../../../api/api/responses/noPrimaryInCluster'),
  wrongStatus: require('../../../api/api/responses/wrongStatus'),
  sshExecutionFailed: require('../../../api/api/responses/sshExecutionFailed')
}

describe('Response', () => {
  Object.keys(responsesToTest).forEach(name => {
    it(`response [${name}] returns string`, (done) => {
      var test = {
        response: responsesToTest[name],
        res: {
          status () { return this },
          send () { return `message` }
        }
      }

      sinon.assert.match(test.response(`message`), `message`)

      done()
    })
  })

  Object.keys(responsesToTest).forEach(name => {
    it(`response with null message [${name}] returns a default messager`, (done) => {
      var test = {
        response: responsesToTest[name],
        res: {
          status () { return this },
          send () { return `default message` }
        }
      }

      sinon.assert.match(test.response(), `default message`)

      done()
    })
  })
})
