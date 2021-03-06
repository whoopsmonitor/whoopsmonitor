const inquirer = require('inquirer')
const boxen = require('boxen')
const logSymbols = require('log-symbols')
const fs = require('fs')
const path = require('path')

const outputDir = '../output'
const composeFile = 'docker-compose.yml'
const composeDevFile = 'docker-compose-dev.yml'

const versions = require('./package.json').appVersions

console.log(
  boxen(
    `
    -> Whoops Monitor <-

    You are about to change the version in installation (Docker Compose) files.
    `,
    { padding: 1 }
  )
)

const composeFilePath = path.join(outputDir, composeFile)
if (!fs.existsSync(composeFilePath)) {
  console.error(logSymbols.error, `Docker Compose file ${composeFilePath} for production does not exists.`)
  process.exit(0)
}

const composeDevFilePath = path.join(outputDir, composeDevFile)
if (!fs.existsSync(composeDevFilePath)) {
  console.error(logSymbols.error, `Docker Compose file ${composeDevFilePath} for local development does not exists.`)
  process.exit(0)
}

const questions = []

// app version
questions.push({
  type: 'list',
  choices: versions,
  name: 'version',
  message: 'Application version',
  default: 0
})

inquirer.prompt(questions).then((answers) => {
  // for (const file of [composeFilePath, composeDevFilePath]) {
  for (const file of [composeFilePath]) {
    try {
      let content = fs.readFileSync(file).toString()
      // replace versions on the specified "image" line
      content = content.replace(/(image:\sghcr\.io\/whoopsmonitor.+:).+$/gm, `$1${answers.version}`)

      fs.writeFileSync(file, content)
      console.log(logSymbols.success, `File ${file} sucessfully updated.`)
    } catch (error) {
      console.error(error)
      console.error(logSymbols.error, `It is not possible to update content of the ${file} file.`)
      process.exit(0)
    }
  }

  console.log(
    boxen(
      `
        ${logSymbols.success} Version changed to ${answers.version}

        You can stop and start all docker containers again:

        docker-compose -p whoopsmonitor down
        docker-compose -p whoopsmonitor up -d
        `, { padding: 1 })
  )
})
