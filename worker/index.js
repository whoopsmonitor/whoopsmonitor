require( 'console-stamp' )( console )
const Queue = require('bull')
const execa = require('execa')
const axios = require('axios')
const logSymbols = require('log-symbols')
const fs = require('fs')
const packageJson = require('./package.json')
const perf = require('execution-time')()
const APP_TOKEN = process.env.APP_TOKEN
const packageName = packageJson.name

const markProgress = async (checkId, progressStatus) => {
  if (!checkId) {
    throw new Error(`Check data not found.`)
  }

  try {
    await axiosInstance.patch(`/v1/check/${checkId}`, {
      progress: progressStatus
    })
  } catch (_) {
    const err = new Error()
    err.message = `Check ${checkId} not found.`
    err.name = 404
    throw err
  }
}

const addToLog = async (checkId, status, output, duration) => {
  try {
    await axiosInstance.post('/v1/checkstatus', {
      check: checkId,
      status: status || 0,
      output: output,
      duration
    })
  } catch (_) {
    const err = new Error()
    err.message = `Check ${checkId} not found.`
    err.name = 404
    throw err
  }
}

const removeJobFromQueue = async (job) => {
  console.log(`[${packageName}] [${logSymbols.info}] [${job.opts.jobId}] Removing job from queue`)
  await executeCheckQueue.removeRepeatable(job.opts.repeat, job.opts.jobId)
}

const getLastStatus = async (checkId) => {
  try {
    return await axiosInstance.get('/v1/checkstatus', {
      params: {
        where: {
          check: checkId
        },
        populate: false,
        sort: 'createdAt desc',
        limit: 1,
        select: 'status,createdAt'
      }
    }).then(res => res.data[0])
  } catch (_) {
    const err = new Error()
    err.message = `[${packageJson.name}] Check ${checkId} not found.`
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

const executeCheckQueue = new Queue(process.env.APP_QUEUE_NAME_EXECUTE_CHECK, {
  redis: {
    host: process.env.APP_REDIS_HOST,
    port: process.env.APP_REDIS_PORT,
    password: process.env.APP_REDIS_PASSWORD
  }
})

const alertingQueue = new Queue(process.env.APP_QUEUE_NAME_ALERTING, {
  redis: {
    host: process.env.APP_REDIS_HOST,
    port: process.env.APP_REDIS_PORT,
    password: process.env.APP_REDIS_PASSWORD
  }
})

executeCheckQueue.process(async (job, done) => {
  perf.start()

  const checkId = job.data.checkId
  const cron = job.data.cron
  const environmentVariables = job.data.environmentVariables
  const immediate = job.data.immediate // run now

  if (!checkId) {
    return done(Error('Check ID not specified.'))
  }

  // get check details
  let check

  // latest status of the check
  let latestStatus

  // perf result
  let perfResult

  try {
    check = await axiosInstance.get(`/v1/check/${checkId}`, {
      params: {
        populate: 'image,alerts',
        select: 'name,enabled,image,environmentVariables,cron,file'
      }
    }).then(response => response.data)
  } catch (error) {
    const err = new Error()
    err.message = `Check ${checkId} not found.`
    err.name = 404
    return done(err)
  }

  if (!check) {
    return done(Error(`Check ${checkId} not found.`))
  }

  if (cron !== check.cron) {
    const err = new Error()
    err.message = `Check ${checkId} does not match the cron.`
    err.name = 404
    return done(err)
  }

  if (environmentVariables !== JSON.stringify(check.environmentVariables)) {
    const err = new Error()
    err.message = `Check environmentVariables ${checkId} do not match.`
    err.name = 404
    return done(err)
  }

  // run the check even it is not enabled
  if (!immediate) {
    if (!check.enabled) {
      console.log(`[${packageName}] [${logSymbols.info}] Check ${checkId} not enabled.`)
      return done(null, {
        check
      })
    }
  }

  if (check.progress) {
    console.log(`[${packageName}] [${logSymbols.info}] Check ${checkId} already in progress.`)
    return done(null, {
      check
    })
  }

  // image condition must be "0", that means image is probably fine
  if (check.image.healthyStatus !== 0) {
    console.error(`[${packageName}] [${logSymbols.error}] Docker image "${check.image.image}" is not healthy, exitCode: ${check.image.healthyStatus}`)
    console.error(`[${packageName}] [${logSymbols.info}] Output:`, check.image.healthyStatusOutput)
    return done(null, {
      check
    })
  }

  // get the latest status
  latestStatus = await getLastStatus(check.id)

  try {
    // mark check as a progress
    await markProgress(checkId, true)

    let commands = []
    // let imageRegistry = check.image.image.split('/')[0]

    // files to copy
    const filesToCopy = []

    if (check.file && check.file.name && check.file.content) {
      const file = check.file
      const fromDir = `/${packageJson.name}/${checkId}/`
      const filePathFrom = `${fromDir}/${file.name}`
      const volumeDirFrom = packageJson.docker_shared_volume // shared volume
      const volumeDirTo = `/${packageJson.name}`

      // make sure the file dir exists on filesystem
      if (fs.existsSync(fromDir)) {
        fs.rmdirSync(fromDir, {
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

    // INFO: do not pull docker images, let's image-metadata to handle it
    // if (check.image.local === false) {
    //   // login with docker if required
    //   if (check.image.username && check.image.password) {
    //     commands.push(`echo "${check.image.password}" | docker login ${imageRegistry} --username ${check.image.username} --password-stdin >/dev/null &&`)
    //   }
    //   commands.push(`docker pull ${check.image.image} >/dev/null &&`)
    // }

    const envVars = []
    const volumeVars = []

    // prepare volumes
    if (filesToCopy.length) {
      for (const fileToCopy of filesToCopy) {
        volumeVars.push(`-v ${fileToCopy.from}:${fileToCopy.to}`)
      }
    }

    for (let envKey in check.environmentVariables) {
      envVars.push(`--env ${envKey}=${check.environmentVariables[envKey]}`)
    }

    // attach check id as well, prefix with "WM_"
    envVars.push(`--env WM_CHECK_ID=${check.id}`)

    commands.push(`docker run --rm ${envVars.join(' ')} ${volumeVars.join(' ')} ${check.image.image}`)

    // debug purpose
    // console.log('Running commands: ', commands)

    console.log(`[${packageName}] [${logSymbols.info}] Running check "${check.name}".`)
    const { stdout, exitCode } = await execa.command(commands.join('\\'), {
      shell: true
    })

    await alertingQueue.add({
      checkId: check.id,
      checkName: check.name,
      alerts: check.alerts.map(alert => alert.id),
      exitCode,
      stdout,
      latestStatus: latestStatus ? latestStatus.status || 0 : 0
    })

    perfResult = perf.stop()

    await addToLog(check.id, 0, stdout, perfResult.time)
    await markProgress(check.id, false)

    return done(null, {
      check
    })
  } catch (error) {
    perfResult = perf.stop()

    // remove job from the queue
    await removeJobFromQueue(job)

    // also make sure the status code is 2 in case of the higher number
    try {
      await addToLog(check.id, (error.exitCode > 2 ? error.exitCode : error.exitCode), error.stdout || error.stderr, perfResult.time)
      await markProgress(check.id, false)

      // add to alert queue
      await alertingQueue.add({
        checkId: check.id,
        checkName: check.name,
        alerts: check.alerts.map(alert => alert.id),
        exitCode: error.exitCode,
        stdout: error.stdout,
        latestStatus: latestStatus ? latestStatus.status || 0 : 0
      })

      return done(error)
    } catch (error) {
      console.error(`[${packageName}] [${logSymbols.error}]`, error)

      return done(error)
    }
  }
})

executeCheckQueue.on('completed', async (job, { check }) => {
  console.log(`[${packageName}] [${logSymbols.success}] Job "${check.name}" done.`)
})

executeCheckQueue.on('error', async (error) => {
  console.error(`[${packageName}] [${logSymbols.error} ${logSymbols.error} ${logSymbols.error}]`, error)
})

executeCheckQueue.on('failed', async (job, error) => {
  // remove job from the queue
  await removeJobFromQueue(job)

  console.error(`[${packageName}] [${logSymbols.error}]`, error.stdout || error.stderr || error)
})
