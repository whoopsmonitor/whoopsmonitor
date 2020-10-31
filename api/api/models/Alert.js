/**
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
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

    repeat: {
      type: 'number',
      defaultsTo: 5 // minutes
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
