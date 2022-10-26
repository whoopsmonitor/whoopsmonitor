const fs = require('fs')
const executionTime = require('execution-time')
const execa = require('execa')
const perf = executionTime()
const queueName = process.env.APP_QUEUE_NAME_WORKER
const APP_NAME = process.env.APP_NAME

const removeJobFromQueue = async (job) => {
  try {
    sails.log.info(`(START) Removing job from queue`)
    if (job.opts && job.opts.jobId) {
      sails.log.info(`(PROGRESS) Removing job from queue, job ID [${job.opts.jobId}]`)
      await sails.hooks.bulljs.worker.removeRepeatable(job.opts.repeat, job.opts.jobId)
    }

    sails.log.info(`(END) Removing job from queue`)
  } catch (error) {
    sails.log.error(`(END) Removing job from queue - unknown error.`)
    sails.log.error('ERROR:', error)
  }
}

const markProgress = async (checkId, progressStatus) => {
  if (!checkId) {
    throw new Error(`Check data not found.`)
  }

  try {
    await Check.update(checkId, {
      progress: progressStatus
    })
  } catch (err) {
    sails.log.error(err)
    err.message = `[mark progress] Check ${checkId} not found.`
    err.name = 404
    throw err
  }
}

const addToLog = async (checkId, status, output, duration) => {
  try {
    await CheckStatus.create({
      check: checkId,
      status: status || 0,
      output: output,
      duration
    })
  } catch (originalError) {
    sails.log.error(originalError)
    const err = new Error()
    err.message = `[checkstatus] Check ${checkId} not found.`
    err.name = 404
    throw err
  }
}

module.exports = {
  queueName,

  guard: async () => {
    return APP_NAME === 'worker-checks'
  },

  process: async (job) => {
    sails.log.info(`(START) Processing job with check ID "${job.data.checkId}" .`)

    const checkId = job.data.checkId
    const cron = job.data.cron
    const environmentVariables = job.data.environmentVariables
    const immediate = job.data.immediate // run now

    if (!checkId) {
      sails.log.error('Check ID not specified.')
      return false
    }

    let check
    let perfResult

    perf.start()

    try {
      check = await Check.findOne({
        where: {
          id: checkId
        },
        select: ['name', 'enabled', 'image', 'environmentVariables', 'cron', 'file']
      })
      .decrypt()
      .populate('image')
      .populate('alerts')
      .populate('sharedEnvironmentVariables')
    } catch (error) {
      sails.log.error(error)
      const err = new Error()
      err.message = `Check ${checkId} not found.`
      err.name = 404

      throw err
    }

    if (!check) {
      throw new Error(`Check ${checkId} not found.`)
    }

    if (cron !== check.cron) {
      const err = new Error()
      err.message = `Check ${checkId} does not match the cron.`
      err.name = 404
      throw err
    }

    if (environmentVariables !== JSON.stringify(check.environmentVariables)) {
      const err = new Error()
      err.message = `Check environmentVariables ${checkId} do not match.`
      err.name = 404
      throw err
    }

    // run the check even it is not enabled
    if (!immediate) {
      if (!check.enabled) {
        throw new Error(`Check ${checkId} not enabled.`)
      }
    }

    if (check.progress) {
      throw new Error(`Check ${checkId} already in progress.`)
    }

    // image condition must be "0", that means image is probably fine
    if (check.image.healthyStatus !== 0) {
      throw new Error(`Docker image "${check.image.image}" is not healthy, exitCode: ${check.image.healthyStatus}, output: ${check.image.healthyStatusOutput}`)
    }

    try {
      // mark check as a progress
      await markProgress(checkId, true)

      // list of commands to join later and execute within the shell
      const commands = []

      // files to attach to running container
      const filesToCopy = []

      if (check.file && check.file.name && check.file.content) {
        const file = check.file
        const fromDir = `${sails.config.paths.tmp}/worker/${checkId}/`
        const filePathFrom = `${fromDir}/${file.name}`
        const volumeDirFrom = `whoopsmonitor_worker_data` // docker volume in docker-compose file
        const volumeDirTo = '/worker/'

        // make sure the file dir exists on filesystem
        if (fs.existsSync(fromDir)) {
          fs.rmSync(fromDir, {
            recursive: true
          })
        }

        // create the dir
        fs.mkdirSync(fromDir, {
          recursive: true
        })

        // write file
        fs.writeFileSync(filePathFrom, file.content)

        filesToCopy.push({
          from: volumeDirFrom,
          to: volumeDirTo
        })
      }

      const envVars = []
      const volumeVars = []

      // prepare volumes
      if (filesToCopy.length) {
        for (const fileToCopy of filesToCopy) {
          volumeVars.push(`-v ${fileToCopy.from}:${fileToCopy.to}`)
        }
      }

      const addslashes = (convert) => {
        let str = JSON.stringify(String(convert))
        str = str.substring(1, str.length - 1)
        return str
      }

      for (let envKey in check.environmentVariables) {
        envVars.push(`--env "${envKey}=${addslashes(check.environmentVariables[envKey])}"`)
      }

      for (let env of check.sharedEnvironmentVariables) {
        envVars.push(`--env "${env.key}=${addslashes(env.value)}"`)
      }

      // attach check id as well, prefix with "WM_"
      envVars.push(`--env 'WM_CHECK_ID=${check.id}'`)

      commands.push(`docker run --rm ${envVars.join(' ')} ${volumeVars.join(' ')} ${check.image.image}`)

      const { stdout, exitCode } = await execa(commands.join('\\'), {
        shell: true
      })

      await sails.hooks.bulljs.alerting.add({
        checkId: check.id,
        checkName: check.name,
        alerts: check.alerts.map(alert => alert.id),
        exitCode,
        stdout
      })

      perfResult = perf.stop()
      await addToLog(check.id, 0, stdout, perfResult.time)
      await markProgress(check.id, false)

      return
    } catch (error) {
      sails.log.error(error)
      perfResult = perf.stop()

      // also make sure the status code is 2 in case of the higher number
      try {
        // remove job from the queue
        await removeJobFromQueue(job)

        await addToLog(check.id, (error.exitCode > 2 ? error.exitCode : error.exitCode), error.stdout || error.stderr, perfResult.time)
        await markProgress(check.id, false)

        // add to alert queue
        sails.log.info(`(START) Adding error result of check "${check.name}" to alert queue.`)
        await sails.hooks.bulljs.alerting.add({
          checkId: check.id,
          checkName: check.name,
          alerts: check.alerts.map(alert => alert.id),
          exitCode: error.exitCode,
          stdout: error.stdout
        })
        sails.log.info(`(DONE) Adding error result of check "${check.name}" to alert queue.`)

        throw error
      } catch (error) {
        throw error
      }
    }
  },

  onCompleted: async (job) => {
    sails.log.info(`(DONE) Job with check ID "${job.data.checkId}" done.`)
  },

  onFailed: async (job, err) => {
    sails.log.error('(FAILED)', err)
    removeJobFromQueue(job)
  },

  onError: async err => {
    sails.log.error('(FATAL)', err)
  }
}
