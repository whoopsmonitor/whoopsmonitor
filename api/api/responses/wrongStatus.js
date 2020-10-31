const JSend = require('jsend')

module.exports = function (data = {}) {
  let res = this.res
  return res.status(500).send(JSend.fail(data))
}
