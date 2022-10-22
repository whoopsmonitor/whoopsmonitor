const finalHandler = require('finalhandler')
const http = require('http')
const serveStatic = require('serve-static')
const auth = require('http-auth')

const doAuth = process.env.BASIC_AUTH_USERNAME && process.env.BASIC_AUTH_PASSWORD

const basic = auth.basic({
  realm: 'whoopsmonitor'
}, (username, password, cb) => {
  const result = process.env.BASIC_AUTH_USERNAME === username && process.env.BASIC_AUTH_PASSWORD === password
  return cb(result)
})

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
server.listen(9000)
