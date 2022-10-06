const inquirer = require('inquirer')
const boxen = require('boxen')
const logSymbols = require('log-symbols')
const fs = require('fs')
const path = require('path')
const execa = require('execa')
const waitForUrl = require('./utils/wait-for-url')

const outputDir = '../output'
const composeFile = 'docker-compose.yml'

console.log(
  boxen(
    `
-> Whoops Monitor - UPDATE <-

You are about to update Whoops Monitor. It might take a while.
`,
    { padding: 1 }
  )
)

const composeFilePath = path.join(outputDir, composeFile)
if (!fs.existsSync(composeFilePath)) {
  console.error(logSymbols.error, `Docker Compose file ${composeFilePath} for production does not exists.`)
  process.exit(0)
}

const questions = []

// confirm
questions.push({
  type: 'confirm',
  name: 'confirm',
  message: 'Would you like to start the update?',
  default: false
})

  ; (async () => {

    inquirer.prompt(questions).then(async (answers) => {
      if (!answers.confirm) {
        console.log('Update process stopped.')
        process.exit(0)
      }

      try {
        console.log(`${logSymbols.info} (start) Downloading updates.`)
        await execa.command([
          `cd ${outputDir} &&`,
          'docker-compose pull',
        ].join('\\'), {
          shell: true
        })
        console.log(`${logSymbols.info} (done) Downloading updates.`)

        // console.log(`${logSymbols.info} (start) Shutting down running containers.`)
        // await execa.command([
        //   `cd ${outputDir} &&`,
        //   'docker-compose down',
        // ].join('\\'), {
        //   shell: true
        // })
        // console.log(`${logSymbols.info} (done) Shutting down running containers.`)

        console.log(`${logSymbols.info} (start) Starting all containers.`)
        await execa.command([
          `cd ${outputDir} &&`,
          'docker-compose up -d --remove-orphans'
        ].join('\\'), {
          shell: true
        })

        console.log(`${logSymbols.info} (done) Starting all containers.`)

        console.log(`${logSymbols.info} (start) Waiting for Monitor to start.`)
        // port "80" is the inner port - we're on the same network
        await waitForUrl('http://monitor:80', 'monitor')
        console.log(`${logSymbols.info} (done) Waiting for Monitor to start.`)
      } catch (error) {
        console.error(error)
        process.exit(1)
      }

      console.log(
        boxen(
          `${logSymbols.success} Update completed. All containers running.`, { padding: 1 })
      )
    })

  })()
