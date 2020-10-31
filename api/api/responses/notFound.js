module.exports = function () {
  let res = this.res
  return res.status(404).send()
}
