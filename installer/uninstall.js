const inquirer = require('inquirer')
const boxen = require('boxen')
const logSymbols = require('log-symbols')
const fs = require('fs')
const path = require('path')
const execa = require('execa')

const outputDir = '../output'
const composeFile = 'docker-compose.yml'

const name = 'whoopsmonitor'

console.log(
  boxen(
    `
-> Whoops Monitor - UNINSTALL <-

You are about to uninstall Whoops Monitor.
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
  message: 'Would you like to uninstall the app?',
  default: false
})

  ; (async () => {

    inquirer.prompt(questions).then(async (answers) => {
      if (!answers.confirm) {
        console.log('Uninstallation process stopped.')
        process.exit(0)
      }

      try {
        console.log(`${logSymbols.info} (start) Shutting down running containers.`)
        await execa.command([
          `cd ${outputDir} &&`,
          'docker-compose -p whoopsmonitor down &> /dev/null',
        ].join('\\'), {
          shell: true
        })
        console.log(`${logSymbols.info} (done) Shutting down running containers.`)

        console.log(`${logSymbols.info} (start) Removing all containers.`)
        await execa.command([
          `cd ${outputDir} &&`,
          'docker-compose -p whoopsmonitor rm &> /dev/null'
        ].join('\\'), {
          shell: true
        })

        console.log(`${logSymbols.info} (done) Removing all containers.`)

        console.log(`${logSymbols.info} (start) Removing related volumes.`)
        await execa.command([
          `cd ${outputDir} &&`,
          `docker volume rm $(docker volume ls -f name=${name} -q) &> /dev/null`
        ].join('\\'), {
          shell: true
        })

        console.log(`${logSymbols.info} (done) Removing related volumes.`)

        console.log(`${logSymbols.info} (start) Removing network.`)
        await execa.command([
          `cd ${outputDir} &&`,
          `docker network rm $(docker network ls -f name=${name} -q) &> /dev/null`
        ].join('\\'), {
          shell: true
        })

        console.log(`${logSymbols.info} (done) Removing network.`)

        console.log(`${logSymbols.info} (start) Removing related images.`)
        await execa.command([
          `cd ${outputDir} &&`,
          `docker images "*/${name}/${name}/*" -q &> /dev/null`
        ].join('\\'), {
          shell: true
        })

        console.log(`${logSymbols.info} (done) Removing network.`)
      } catch (error) {
        console.error(error)
        // do not exit
        // process.exit(1)
      }

      console.log(
        boxen(
          `${logSymbols.success} Uninstallation completed.`, { padding: 1 })
      )
    })

  })()
