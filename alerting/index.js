import { readFileSync } from 'fs'
import Queue from 'bull'
import { execa } from 'execa'
import axios from 'axios'
import logSymbols from 'log-symbols'
import c from 'console-stamp'
import executionTime from 'execution-time'
import { DateTime, Interval } from 'luxon'
const packageName = JSON.parse(readFileSync('package.json')).name
const perf = executionTime()
c(console)

const APP_TOKEN = process.env.APP_TOKEN

const addToLog = async (alertId, status, output, checkStdout, checkExitCode, duration) => {
  try {
    await axiosInstance.post('/v1/alertstatus', {
      alert: alertId,
      status: status || 0,
      output: output,
      duration,
      checkOutput: checkStdout,
      checkExitCode
    })
  } catch (_) {
    const err = new Error()
    err.message = `[${packageName}] Alert ${alertId} not found.`
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
  const results = []

  for (const alertId of alerts) {
    perf.start()

    try {
      const alert = await axiosInstance.get(`/v1/alert/${alertId}`, {
        params: {
          populate: 'sharedEnvironmentVariables,image',
          select: 'enabled,name,image,environmentVariables,repeat,createdAt,level'
        }
      }).then(response => response.data)

      if (alert.enabled === null) {
        // if no info about being enabled is available, presume it is on
        alert.enabled = true
      }

      // alert is not enabled at all
      if (!alert.enabled) {
        continue
      }

      // exclusion by level if configured
      if (!alert.level.length) {
        if (alert.level.indexOf(checkExitCode) === -1) {
          continue
        }
      }

      // get alert status as well
      const latestStatuses = await axiosInstance.get(`/v1/alertstatus`, {
        params: {
          select: 'createdAt,checkExitCode',
          limit: 2, // only 2 latests
          where: {
            alert: alertId
          },
          populate: false,
          sort: 'createdAt desc'
        }
      }).then(response => response.data) // just the first item in array

      if (latestStatuses.length) {
        const lastStatus = latestStatuses[0]
        const previousStatus = latestStatuses[1]

        // we do not process the alert in case the exit code and latest status are both "ok"
        if (lastStatus.checkExitCode === 0 && checkExitCode === 0) {
          console.log(`[${packageName}] [${logSymbols.success}] No notificitation needs to be sent.`)
          return done()
        }

        // compare exit codes - in case they differ, send message even the repeat interval is not yet completed
        let checkAlsoForInterval = false
        if (previousStatus) {
          if (checkExitCode === lastStatus.checkExitCode) {
            checkAlsoForInterval = true
          }
        }

        // check repeat interval
        if (checkAlsoForInterval) {
          const start = DateTime.fromMillis(lastStatus.createdAt)
          const end = DateTime.local()

          const diffInMinutes = Interval.fromDateTimes(start, end).toDuration('minutes').minutes

          if (alert.repeat > diffInMinutes) {
            const nextRun = alert.repeat - Math.round(diffInMinutes)

            // stop notification, already notified
            console.log(
              `${logSymbols.info} Alert "${alert.name}" already sent. Waiting for the next scheduled interval (${nextRun <= 1 ? 'in a minute' : 'in ' + nextRun + ' minutes'}).
            `)
            continue
          }
        }
      }

      const addslashes = (convert) => {
        let str = JSON.stringify(String(convert))
        str = str.substring(1, str.length - 1)
        return str
      }

      const commands = []
      const envVars = []

      for (let envKey in alert.environmentVariables) {
        envVars.push(`--env ${envKey}="${addslashes(alert.environmentVariables[envKey])}"`)
      }

      for (let env of alert.sharedEnvironmentVariables) {
        envVars.push(`--env "${env.key}=${addslashes(env.value)}"`)
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
      await addToLog(alertId, exitCode, stdout, checkStdout, checkExitCode, perfResult.time)

      results.push(stdout)
    } catch (error) {
      const perfResult = perf.stop()

      console.error(`[${packageName}]`, error)

      // make sure that the result is saved
      try {
        await addToLog(alertId, error.exitCode, error.stderr, checkStdout, checkExitCode, perfResult.time)
      } catch (error) {
        console.error(`[${packageName}]`, error)
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
  console.error(`${logSymbols.error} [${packageName}]`, error)
})
