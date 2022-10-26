const Path = require('path')

/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/

  middleware: {

    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP requests.           *
    * (This Sails app's routes are handled by the "router" middleware below.)  *
    *                                                                          *
    ***************************************************************************/

    // order: [
    //   'cookieParser',
    //   'session',
    //   'bodyParser',
    //   'compress',
    //   'poweredBy',
    //   'router',
    //   'www',
    //   'favicon',
    // ],

    order: [
      'cookieParser',
      'bodyParser',
      'compress',
      'poweredBy',
      'router',
      'favicon'
    ],

    poweredBy: function (req, res, next) {
      res.header('X-Powered-By', 'Whoops Monitor <info@whoopsmonitor.app>')
      res.header('X-Served-By', req.hostname)
      next()
    },

    favicon: (function () {
      let toServeFavicon = require('serve-favicon')
      let pathToDefaultFavicon = Path.resolve(process.cwd(), './static/images/favicon-16x16.png')
      let serveFaviconMwr = toServeFavicon(pathToDefaultFavicon)
      return serveFaviconMwr
    })()

    /***************************************************************************
    *                                                                          *
    * The body parser that will handle incoming multipart HTTP requests.       *
    *                                                                          *
    * https://sailsjs.com/config/http#?customizing-the-body-parser             *
    *                                                                          *
    ***************************************************************************/

    // bodyParser: (function _configureBodyParser(){
    //   var skipper = require('skipper');
    //   var middlewareFn = skipper({ strict: true });
    //   return middlewareFn;
    // })(),

  },

};
