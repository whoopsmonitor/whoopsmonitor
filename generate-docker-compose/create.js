const inquirer = require('inquirer')
const boxen = require('boxen')
const logSymbols = require('log-symbols')
const ejs = require('ejs')
const generatePassword = require('generate-password')
const fs = require('fs')
const path = require('path')

const APP_NAME = 'whoopsmonitor'
const outputDir = '../output'
const composeFile = 'docker-compose.yml'
const composeDevFile = 'docker-compose-dev.yml'

const versions = require('./package.json').appVersions

console.log(
  boxen(
    `
    Thank you for chosing

    -> Whoops Monitor <-

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

const MONGODB_DATABASE = 'whoopsmonitor'

const MONGODB_USERNAME = generatePassword.generate({
  length: 32,
  numbers: true
})

const MONGODB_PASSWORD = generatePassword.generate({
  length: 32,
  numbers: true
})

let BASIC_AUTH_USERNAME = generatePassword.generate({
  length: 32,
  numbers: true
})

let BASIC_AUTH_PASSWORD = generatePassword.generate({
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

// app version
questions.push({
  type: 'list',
  choices: versions,
  name: 'version',
  message: 'Application version',
  default: 0
})

// base auth
questions.push({
  type: 'confirm',
  name: 'baseAuth',
  default: false,
  message: 'Would like to protect the entire administration panel on production with base auth credentials?'
})

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

  if (!answers.baseAuth) {
    BASIC_AUTH_USERNAME = undefined
    BASIC_AUTH_PASSWORD = undefined
  }

  for (const file of [`${composeFile}.ejs`, `${composeDevFile}.ejs`]) {
    ejs.renderFile(file, {
      APP_VERSION: answers.version,
      APP_NAME,
      APP_PASSWORD,
      APP_REDIS_PASSWORD,
      APP_DATA_ENCRYPTION_KEY,
      APP_TOKEN,
      MONGODB_ROOT_PASSWORD,
      MONGODB_DATABASE,
      MONGODB_USERNAME,
      MONGODB_PASSWORD,
      BASIC_AUTH_USERNAME,
      BASIC_AUTH_PASSWORD
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

  console.log(
    boxen(
      `
      ${logSymbols.success} Installation completed.

      Now you can start all Docker Containers on background with:

      docker-compose -p whoopsmonitor up -d


      Don't forget your credentials:
      - Monitor Login: ${APP_PASSWORD}
      ${BASIC_AUTH_USERNAME ? '- Basic Auth (username): ' + BASIC_AUTH_USERNAME : ''}
      ${BASIC_AUTH_PASSWORD ? '- Basic Auth (password): ' + BASIC_AUTH_PASSWORD : ''}
      `.trimRight(`
      `),
      { padding: 1 }
    )
  )
})