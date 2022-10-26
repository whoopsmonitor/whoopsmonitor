/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

const blueprintTokenPolicy = {
  find: 'token',
  findOne: 'token',
  create: 'token',
  update: 'token',
  destroy: 'token',
  populate: 'token',
  add: 'token',
  remove: 'token',
  replace: 'token',
}

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

  AlertController: blueprintTokenPolicy,
  AlertStatusController: blueprintTokenPolicy,
  ConfigurationController: blueprintTokenPolicy,
  DockerImageController: blueprintTokenPolicy,
  HealthIndexController: blueprintTokenPolicy,
  CheckController: blueprintTokenPolicy,
  CheckStatusController: blueprintTokenPolicy,
  EnvironmentVariablesController: blueprintTokenPolicy,

  'v1/check/reorder-all': 'token',
  'v1/check/run': 'token',
  'v1/check/tags': 'token',

  'v1/checkstatus/aggregate': 'token',
  'v1/checkstatus/aggregate-by-day': 'token',
  'v1/checkstatus/aggregate-metric-by-day': 'token',

  'v1/dockerimage/envvars': 'token',

  'v1/queue/clean': 'token',
  'v1/queue/find': 'token',

  'v1/backup/find': 'token',
  'v1/backup/create': 'token',
  'v1/backup/download': 'token',
  'v1/backup/destroy': 'token',
  'v1/backup/restore': 'token',

  'v1/demodata/create': 'token',
  'v1/realtime/join': 'token'
}
