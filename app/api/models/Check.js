/**
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    enabled: {
      type: 'boolean',
      defaultsTo: false
    },

    name: {
      type: 'string',
      required: true
    },

    description: {
      type: 'string'
    },

    tags: {
      type: 'ref'
    },

    image: {
      model: 'DockerImage',
      required: true
    },

    alerts: {
      collection: 'Alert'
    },

    cron: {
      type: 'string'
    },

    environmentVariables: {
      type: 'json',
      encrypt: true
    },

    sharedEnvironmentVariables: {
      collection: 'EnvironmentVariables',
      via: 'check'
    },

    progress: {
      type: 'boolean',
      defaultsTo: false
    },

    file: {
      type: 'json'
    },

    display: {
      type: 'json'
    },
    order: {
      type: 'number',
      defaultsTo: 0
    }
  },
  customToJSON: function () {
    // encrypt env vars
    if (this.environmentVariables) {
      this.environmentVariables = sails.helpers.decryptAttribute(this.environmentVariables)
    }

    // must be cloned otherwise "this" is handled as refference
    return _.clone(this)
  },

  beforeCreate: async function (records, proceed) {
    try {
      records.order = await Check.count({})
    } catch (error) {
      if (error) {
        sails.log.error(error)
      }
    }

    if (typeof proceed === 'function') {
      return proceed()
    }
  },

  beforeDestroy: async function (criteria, proceed) {
    if (typeof criteria.where.id !== 'undefined') {
      const check = criteria.where.id

      // clean up statuses
      try {
        const results = await CheckStatus.destroy({
          check: check
        }).fetch()

        sails.log(`[ok][model-check] Destroyed check ${check} and ${results.length || 0} check status records.`)
      } catch (error) {
        sails.log.error(error)
        sails.log(`[!][model-check] Destroyed check ${check} but not the check statuses.`)
      }
    }

    return proceed()
  }
}
