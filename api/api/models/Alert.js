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

    environmentVariables: {
      type: 'json',
      encrypt: true
    },

    sharedEnvironmentVariables: {
      collection: 'EnvironmentVariables',
      via: 'alert'
    },

    repeat: {
      type: 'number',
      defaultsTo: 5 // minutes
    },

    level: {
      type: 'json',
      columnType: 'array',
      defaultsTo: [1, 2]
    }
  },
  customToJSON: function () {
    // encrypt env vars in case it is a encrypted string, skip otherwise
    if (this.environmentVariables) {
      this.environmentVariables = sails.helpers.decryptAttribute(this.environmentVariables.toString())
    }

    // must be cloned otherwise "this" is handled as refference
    return _.clone(this)
  },

  beforeDestroy: async function (criteria, proceed) {
    if (typeof criteria.where.id !== 'undefined') {
      const alert = criteria.where.id

      // clean up statuses
      try {
        const results = await AlertStatus.destroy({
          alert: alert
        }).fetch()

        sails.log(`[ok][model-alert] Destroyed alert ${alert} and ${results.length || 0} alert status records.`)
      } catch (error) {
        sails.log.error(error)
        sails.log(`[!][model-alert] Destroyed alert ${alert} but not the alert statuses.`)
      }
    }

    return proceed()
  }
}
