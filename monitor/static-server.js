const finalHandler = require('finalhandler')
const http = require('http')
const serveStatic = require('serve-static')
const auth = require('http-auth')
const fs = require('fs')

const doAuth = process.env.BASIC_AUTH_USERNAME && process.env.BASIC_AUTH_PASSWORD
const API_TOKEN = process.env.API_TOKEN
const APP_API_URL = process.env.APP_API_URL

const basic = auth.basic({
  realm: 'whoopsmonitor'
}, (username, password, cb) => {
  const result = process.env.BASIC_AUTH_USERNAME === username && process.env.BASIC_AUTH_PASSWORD === password
  return cb(result)
})

const configFilePath = 'dist/spa/config.json'

// write a config file
if (fs.existsSync(configFilePath)) {
  fs.unlinkSync(configFilePath)
}

fs.writeFileSync(
  configFilePath,
  JSON.stringify({
    "API_TOKEN": API_TOKEN || "",
    "APP_API_URL": APP_API_URL || ""
  }, null, 2)
)

// Serve up public/ftp folder
var serve = serveStatic('dist/spa', { 'index': ['index.html'] })

// Create server
var server = http.createServer(
  doAuth ? basic.check((req, res) => {
    return serve(req, res, finalHandler(req, res))
  }) : (req, res) => {
    serve(req, res, finalHandler(req, res))
  }
)

// Listen
server.listen(80)
