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

    progress: {
      type: 'boolean',
      defaultsTo: false
    },

    file: {
      type: 'json'
    },

    display: {
      type: 'json'
    }
  },
  customToJSON: function () {
    // encrypt env vars
    if (this.environmentVariables) {
      this.environmentVariables = sails.helpers.decryptAttribute(this.environmentVariables)
    }

    return this
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
