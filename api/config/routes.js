/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
   *                                                                          *
   * More custom routes here...                                               *
   * (See https://sailsjs.com/config/routes for examples.)                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the routes in this file, it   *
   * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
   * not match any of those, it is matched against static assets.             *
   *                                                                          *
   ***************************************************************************/

  //  ╔═╗╔═╗╦  ╔═╗╔╗╔╔╦╗╔═╗╔═╗╦╔╗╔╔╦╗╔═╗
  //  ╠═╣╠═╝║  ║╣ ║║║ ║║╠═╝║ ║║║║║ ║ ╚═╗
  //  ╩ ╩╩  ╩  ╚═╝╝╚╝═╩╝╩  ╚═╝╩╝╚╝ ╩ ╚═╝

  //  ╦ ╦╔═╗╔╗ ╦ ╦╔═╗╔═╗╦╔═╔═╗
  //  ║║║║╣ ╠╩╗╠═╣║ ║║ ║╠╩╗╚═╗
  //  ╚╩╝╚═╝╚═╝╩ ╩╚═╝╚═╝╩ ╩╚═╝

  //  ╔╦╗╦╔═╗╔═╗
  //  ║║║║╚═╗║
  //  ╩ ╩╩╚═╝╚═╝

  'GET /': 'index',
  'GET /status': 'index',
  'GET /v1/status': 'index',

  'POST /v1/check/reorder-all': 'v1/check/reorder-all',
  'GET /v1/check/:id/run': 'v1/check/run',
  'GET /v1/check/tags': 'v1/check/tags',

  'GET /v1/checkstatus/aggregate/:checkId?': 'v1/checkstatus/aggregate',
  'GET /v1/checkstatus/aggregate-by-day/:checkId?': 'v1/checkstatus/aggregate-by-day',
  'GET /v1/checkstatus/aggregate-metric-by-day/:checkId?': 'v1/checkstatus/aggregate-metric-by-day',
  'GET /v1/checkstatus/isfailing': 'v1/checkstatus/isfailing',
  'GET /v1/checkstatus': 'v1/checkstatus/find',

  // do login
  'POST /v1/auth/login': 'v1/auth/login',

  // healthcheck - disable delete blueprint route
  'DELETE /v1/healthindex/:id': {
    response: 'notFound'
  },

  'GET /v1/dockerimage/:id/envvars': 'v1/dockerimage/envvars',
  'GET /v1/dockerimage/list': 'v1/dockerimage/list',

  // count records
  'GET /v1/queue/:name': 'v1/queue/find',

  // clear records in all queues
  'DELETE /v1/queue/:name': 'v1/queue/clean',

  'GET /v1/backup': 'v1/backup/find',
  'POST /v1/backup': 'v1/backup/create',
  'GET /v1/backup/:id/download': 'v1/backup/download',
  'POST /v1/backup/:id/restore': 'v1/backup/restore',
  'DELETE /v1/backup/:id': 'v1/backup/destroy',

  // install demo data
  'POST /v1/demodata': 'v1/demodata/create',
}
