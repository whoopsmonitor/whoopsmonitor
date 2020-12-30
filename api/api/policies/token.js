const APP_TOKEN = process.env.APP_TOKEN

module.exports = async function (req, res, proceed) {
  const queryToken = req.query.token

  if (!req.headers.authorization && !queryToken) {
    return res.forbidden()
  }

  // check token in URL query first (like download backups etc.)
  if (queryToken) {
    if (queryToken !== APP_TOKEN) {
      return res.forbidden()
    } else {
      return proceed()
    }
  }

  // now get for the headers
  const authorization = req.headers.authorization

  let token = authorization.split(' ')[1]

  if (!token) {
    return res.forbidden()
  }

  if (token !== APP_TOKEN) {
    return res.forbidden()
  }

  return proceed()
}
