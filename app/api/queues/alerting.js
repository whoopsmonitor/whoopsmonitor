const APP_NAME = process.env.APP_NAME
const queueName = process.env.APP_QUEUE_NAME_ALERTING

module.exports = {
  queueName,

  guard: async () => {
    return APP_NAME === 'worker-alerts'
  },

  process: async (job) => {
    console.log('=========== tu jsem ========')
  }
}
