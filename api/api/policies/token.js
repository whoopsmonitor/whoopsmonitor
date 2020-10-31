const APP_TOKEN = process.env.APP_TOKEN

module.exports = async function (req, res, proceed) {
  if (!req.headers.authorization) {
    return res.forbidden()
  }

  const authorization = req.headers.authorization

  let token = authorization.split(' ')[1]

  if (!token) {
    return res.forbidden();
  }

  if (token !== APP_TOKEN) {
    return res.forbidden();
  }

  return proceed()
}
