const inquirer = require('inquirer')
const boxen = require('boxen')
const logSymbols = require('log-symbols')
const ejs = require('ejs')
const generatePassword = require('generate-password')
const fs = require('fs')
const path = require('path')
const execa = require('execa')
const waitForUrl = require('./utils/wait-for-url')

const APP_NAME = 'whoopsmonitor'
const outputDir = '../output'
const composeFile = 'docker-compose.yml'
const composeDevFile = 'docker-compose-dev.yml'
const envFile = '.env'
const NODE_ENV = process.env.NODE_ENV || 'production'
const CONFIG_CORS_ALLOW_ORIGINS = "'*'"
const MONGODB_PORT = 27017
const MONGODB_HOST = 'whoopsmonitor-mongodb'
const APP_REDIS_CONNECTION_HOST = 'whoopsmonitor-redis'
const APP_REDIS_CONNECTION_PORT = 6379
const APP_QUEUE_NAME_WORKER = 'worker'
const APP_QUEUE_NAME_ALERTING = 'alerting'
const APP_REDIS_SOCKETS_CONNECTION_HOST = 'whoopsmonitor-redis-sockets'
const APP_REDIS_SOCKETS_CONNECTION_PORT = 6379
const APP_SOCKETS_ALLOW_ORIGINS = 'http://localhost:9000'
const APP_NAME_API = 'api'
const APP_NAME_WORKER_AGGREGATE = 'worker-aggregate'
const APP_NAME_WORKER_CHECKS = 'worker-checks'
const APP_NAME_WORKER_ALERTS = 'worker-alerts'
const ADMIN_URL = 'http://localhost:9000'
const APP_API_URL_WEB = 'http://localhost:1337'
const APP_API_URL = 'http://whoopsmonitor-api:1337'

const dockerImageVersion = require('./package.json').dockerImageVersion

console.log(
  boxen(
    `
    Thank you for chosing

    -> Whoops Monitor, version ${dockerImageVersion} <-

    Instalation continues bellow.

    * All security credentials are going to be generated automatically.
    `,
    { padding: 1 }
  )
)

const APP_PASSWORD = generatePassword.generate({
  length: 32,
  numbers: true
})

const APP_REDIS_PASSWORD = generatePassword.generate({
  length: 32,
  numbers: true
})

const APP_REDIS_SOCKETS_PASSWORD = generatePassword.generate({
  length: 32,
  numbers: true
})

const randomString = generatePassword.generate({
  length: 32,
  numbers: true
})

let buff = Buffer.from(randomString)
let APP_DATA_ENCRYPTION_KEY = buff.toString('base64')

const APP_TOKEN = generatePassword.generate({
  length: 64,
  numbers: true
})

const MONGODB_ROOT_PASSWORD = generatePassword.generate({
  length: 32,
  numbers: true
})

const MONGODB_DATABASE = APP_NAME

const MONGODB_USERNAME = generatePassword.generate({
  length: 32,
  numbers: true
})

const MONGODB_PASSWORD = generatePassword.generate({
  length: 32,
  numbers: true
})

let questions = []

const composeFilePath = path.join(outputDir, composeFile)
const composeDevFilePath = path.join(outputDir, composeDevFile)

if (fs.existsSync(composeFilePath) || fs.existsSync(composeDevFilePath)) {
  questions.push({
    type: 'confirm',
    name: 'overrideComposeFiles',
    message: 'Docker Compose files already exists. Would you like to override those files?',
    default: false
  })
}

inquirer.prompt(questions).then((answers) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  var terminate = false
  if (fs.existsSync(composeFilePath)) {
    if (answers.overrideComposeFiles) {
      fs.unlinkSync(composeFilePath)
    } else {
      terminate = true
    }
  }

  if (fs.existsSync(composeDevFilePath)) {
    if (answers.overrideComposeFiles) {
      fs.unlinkSync(composeDevFilePath)
    } else {
      terminate = true
    }
  }

  if (terminate) {
    console.log(logSymbols.info, 'Process terminated. Nothing happened.')
    process.exit(0)
  }

  for (const file of [`${composeFile}.ejs`, `${composeDevFile}.ejs`, `${envFile}.ejs`]) {
    ejs.renderFile(`templates/${file}`, {
      NODE_ENV,
      CONFIG_CORS_ALLOW_ORIGINS,
      DOCKER_IMAGE_VERSION: dockerImageVersion,
      APP_NAME,
      APP_PASSWORD,
      APP_REDIS_PASSWORD,
      APP_DATA_ENCRYPTION_KEY,
      APP_TOKEN,
      APP_API_URL,
      APP_API_URL_WEB,
      MONGODB_ROOT_PASSWORD,
      MONGODB_DATABASE,
      MONGODB_USERNAME,
      MONGODB_PASSWORD,
      MONGODB_PORT,
      MONGODB_HOST,
      APP_REDIS_CONNECTION_HOST,
      APP_REDIS_CONNECTION_PORT,
      APP_QUEUE_NAME_WORKER,
      APP_QUEUE_NAME_ALERTING,
      APP_REDIS_SOCKETS_PASSWORD,
      APP_REDIS_SOCKETS_CONNECTION_HOST,
      APP_REDIS_SOCKETS_CONNECTION_PORT,
      APP_SOCKETS_ALLOW_ORIGINS,
      APP_NAME_API,
      APP_NAME_WORKER_AGGREGATE,
      APP_NAME_WORKER_CHECKS,
      APP_NAME_WORKER_ALERTS
    }, {}, function (err, str) {
      if (err) {
        console.error(err)
        console.error(logSymbols.error, `It is not possible to generate compose file from ${file} file.`)
        process.exit(0)
      }

      const filename = file.replace('.ejs', '')

      try {
        fs.writeFileSync(`${outputDir}/${filename}`, str)
      } catch (error) {
        console.error(error)
        console.error(logSymbols.error, `It is not possible to generate ${filename} file.`)
        process.exit(0)
      }

      console.log(logSymbols.success, `File ${outputDir}/${filename} sucessfully created.`)
    })
  }

  ; (async () => {
    try {
      console.log(`${logSymbols.info} Starting all containers on background.`)
      await execa.command([
        `cd ${outputDir} &&`,
        `docker-compose up -d --remove-orphans`
      ].join('\\'), {
        shell: true
      })

      console.log(`${logSymbols.info} (start) Waiting for Monitor to start.`)
      await waitForUrl(ADMIN_URL, 'monitor')
      console.log(`${logSymbols.info} (done) Waiting for Monitor to start.`)
    } catch (error) {
      console.error(error)
      process.exit(2)
    }

    console.log(
      boxen(
        `
        ${logSymbols.success} Installation completed.

        Don't forget your credentials:

        - URL: ${ADMIN_URL}
        - Monitor Login: ${APP_PASSWORD}
        `.trimEnd(`
        `),
        { padding: 1 }
      )
    )
  })()
})
