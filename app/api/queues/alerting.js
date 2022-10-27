const { DateTime, Interval } = require('luxon')
const execa = require('execa')
const executionTime = require('execution-time')

const perf = executionTime()
const APP_NAME = process.env.APP_NAME
const queueName = process.env.APP_QUEUE_NAME_ALERTING
const results = []

const addToLog = async (alertId, status, output, checkStdout, checkExitCode, duration) => {
  try {
    await AlertStatus.create({
      alert: alertId,
      status: status || 0,
      output: output,
      duration,
      checkOutput: checkStdout,
      checkExitCode
    })
  } catch (originalError) {
    sails.log.error(originalError)

    const err = new Error()
    err.message = `Alert ${alertId} not found.`
    err.name = 404
    throw err
  }
}

module.exports = {
  queueName,

  guard: async () => {
    return APP_NAME === 'worker-alerts'
  },

  process: async (job) => {
    const checkName = job.data.checkName
    const alerts = job.data.alerts
    const checkExitCode = job.data.exitCode || 0
    const checkStdout = job.data.stdout

    sails.log.info(`[${checkName}] (START) Running alert.`)

    for (const alertId of alerts) {
      perf.start()

      try {
        const alert = await Alert.findOne({
          where: {
            id: alertId
          },
          select: ['enabled', 'name', 'image', 'environmentVariables', 'repeat', 'createdAt', 'level']
        })
          .populate('sharedEnvironmentVariables')
          .decrypt()

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
        const latestStatuses = await AlertStatus.find({
          where: {
            alert: alertId
          },
          select: ['createdAt', 'checkExitCode']
        })
        .sort('createdAt desc')
        .limit(2)

        if (latestStatuses.length) {
          const lastStatus = latestStatuses[0]
          const previousStatus = latestStatuses[1]

          // we do not process the alert in case the exit code and latest status are both "ok"
          if (lastStatus.checkExitCode === 0 && checkExitCode === 0) {
            sails.log.info(`[${checkName}] (INFO) No notificitation needs to be sent.`)
            return
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
              sails.log.info(
                `[${checkName}] (INFO) Alert "${alert.name}" already sent. Waiting for the next scheduled interval (${nextRun <= 1 ? 'in a minute' : 'in ' + nextRun + ' minutes'}).
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

        console.log(alert)

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

        sails.log.error(`[${checkName}] (ERROR)`, error)

        // make sure that the result is saved
        try {
          await addToLog(alertId, error.exitCode, error.stderr, checkStdout, checkExitCode, perfResult.time)
        } catch (error) {
          sails.log.error(`[${checkName}] (ERROR)`, error)
        }
      }
    }
  },

  onCompleted: async (job) => {
    if (results && results.length) {
      for (const result of results) {
        console.log(`(OK) ${result}`)
      }
    }

    sails.log.info(`[${job.data.checkName}] (DONE) Running alert.`)
  },

  onFailed: async (job, err) => {
    sails.log.error(`[${job.data.checkName}] (FAILED)`, err)
  },

  onError: async err => {
    sails.log.error('(FATAL)', err)
  }
}
