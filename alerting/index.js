var Queue = require('bull')
const execa = require('execa')
const axios = require('axios')
const logSymbols = require('log-symbols')
const packageJson = require('./package.json')
const perf = require('execution-time')()
const { DateTime, Interval } = require('luxon')
const APP_TOKEN = process.env.APP_TOKEN

const addToLog = async (alertId, status, output, duration) => {
  try {
    await axiosInstance.post('/v1/alertstatus', {
      alert: alertId,
      status: status || 0,
      output: output,
      duration
    })
  } catch (_) {
    const err = new Error()
    err.message = `[${packageJson.name}] Alert ${alertId} not found.`
    err.name = 404
    throw err
  }
}

const axiosInstance = axios.create({
  baseURL: process.env.APP_API_URL,
  timeout: 3000,
  headers: {
    'Authorization': `Bearer ${APP_TOKEN}`
  }
})

var queue = new Queue(process.env.APP_QUEUE_NAME_ALERTING, {
  redis: {
    host: process.env.APP_REDIS_HOST,
    port: process.env.APP_REDIS_PORT,
    password: process.env.APP_REDIS_PASSWORD
  }
})

queue.process(async (job, done) => {
  const checkName = job.data.checkName
  const alerts = job.data.alerts
  const checkExitCode = job.data.exitCode || 0
  const checkStdout = job.data.stdout
  const latestStatus = job.data.latestStatus
  const results = []

  // we do not process the alert in case the exit code and latest status are both "ok"
  if (latestStatus === 0 && checkExitCode === 0) {
    console.log(`[${packageJson.name}] [${logSymbols.success}] No notificitation needs to be sent.`)
    return done()
  }

  for (const alertId of alerts) {
    perf.start()

    try {
      const alert = await axiosInstance.get(`/v1/alert/${alertId}`, {
        params: {
          select: 'name,image,environmentVariables,repeat,createdAt'
        }
      }).then(response => response.data)

      // get alert status as well
      const latestStatus = await axiosInstance.get(`/v1/alertstatus`, {
        params: {
          select: 'createdAt',
          limit: 1, // only 1 should be enough
          where: {
            alert: alertId
          },
          populate: false,
          sort: 'createdAt desc'
        }
      }).then(response => response.data[0]) // just the first item in array

      if (latestStatus) {
        // check repeat interval
        const start = DateTime.fromMillis(latestStatus.createdAt)
        const end = DateTime.local()

        const diffInMinutes = Interval.fromDateTimes(start, end).toDuration('minutes').minutes

        if (alert.repeat > diffInMinutes) {
          const nextRun = alert.repeat - Math.round(diffInMinutes)

          // stop notification, already notified
          console.log(
            `${logSymbols.info} Alert "${alert.name}" already sent. Waiting for the next interval (${nextRun <= 1 ? 'in a minute' : 'in ' + nextRun + ' minutes'}).
          `)
          continue
        }
      }

      let commands = []
      let imageRegistry = alert.image.image.split('/')[0]

      // let's download the image
      if (alert.image.local === false) {
        if (alert.image.username && alert.image.password) {
          commands.push(`echo "${alert.image.password}" | docker login ${imageRegistry} --username ${alert.image.username} --password-stdin >/dev/null &&`)
        }
        commands.push(`docker pull ${alert.image.image} >/dev/null &&`)
      }

      const envVars = []

      for (let envKey in alert.environmentVariables) {
        envVars.push(`--env ${envKey}="${alert.environmentVariables[envKey]}"`)
      }

      // special env vars
      envVars.push(`--env WM_CHECK_NAME="${checkName}"`)
      envVars.push(`--env WM_CHECK_EXIT_CODE=${checkExitCode}`)
      envVars.push(`--env WM_CHECK_OUTPUT="${checkStdout}"`)

      commands.push(`docker run --rm ${envVars.join(' ')} ${alert.image.image}`)

      // debugging
      // console.log('Running commands: ', commands)

      // alert in case that exit code is not "ok" or is "ok" and the previous one failed
      const { stdout, exitCode } = await execa.command(commands.join('\\'), {
        shell: true
      })

      const perfResult = perf.stop()

      // make sure that the result is saved
      await addToLog(alertId, exitCode, stdout, perfResult.time)

      results.push(stdout)
    } catch (error) {
      const perfResult = perf.stop()

      console.error(`[${packageJson.name}]`, error)

      // make sure that the result is saved
      try {
        await addToLog(alertId, error.exitCode, error.stderr, perfResult.time)
      } catch (error) {
        console.error(`[${packageJson.name}]`, error)
      }

    }
  }

  return done(null, results)
})

queue.on('completed', async (job, results) => {
  if (results && results.length) {
    for (const result of results) {
      console.log(`${logSymbols.success} ${result}`)
    }
  }
})

queue.on('error', async (error) => {
  console.error(`[${logSymbols.error} ${logSymbols.error} ${logSymbols.error}]`, error)
})

queue.on('failed', async (job, error) => {
  console.error(`${logSymbols.error} [${packageJson.name}]`, error)
})
