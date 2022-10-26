module.exports.bulljs = {
  redis: {
    port: process.env.APP_REDIS_CONNECTION_PORT,
    host: process.env.APP_REDIS_CONNECTION_HOST,
    db: 0,
    password: process.env.APP_REDIS_PASSWORD
  }
}
