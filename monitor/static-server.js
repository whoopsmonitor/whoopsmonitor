const finalHandler = require('finalhandler')
const http = require('http')
const serveStatic = require('serve-static')

// Serve up public/ftp folder
var serve = serveStatic('dist/spa', { 'index': ['index.html'] })

// Create server
var server = http.createServer(
  (req, res) => {
    serve(req, res, finalHandler(req, res))
  }
)

// Listen
server.listen(9000)
