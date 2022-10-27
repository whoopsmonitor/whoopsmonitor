/**
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const TYPE_CHECK = 'check'
// const TYPE_ALERT = 'alert'

module.exports = {
  attributes: {
    image: {
      type: 'string',
      required: true,
      unique: true
    },

    username: {
      type: 'string',
      encrypt: true
    },

    password: {
      type: 'string',
      encrypt: true
    },

    type: {
      type: 'string',
      defaultsTo: TYPE_CHECK
    },

    local: {
      type: 'boolean',
      defaultsTo: false
    },

    metadata: {
      type: 'string'
    },

    healthyStatus: {
      type: 'number',
      defaultsTo: -1 // "-1" means we don't know yet
    },

    healthyStatusOutput: {
      type: 'string'
    }
  },

  customToJSON: function () {
    // encrypt username and password
    if (this.username) {
      this.username = sails.helpers.decryptAttribute(this.username)
    }

    if (this.password) {
      this.password = sails.helpers.decryptAttribute(this.password)
    }

    // must be cloned otherwise "this" is handled as refference
    return _.clone(this)
  },

  beforeDestroy: async function (criteria, proceed) {
    if (typeof criteria.where.id !== 'undefined') {
      const image = criteria.where.id

      // clean up all checks, that will also remove check statuses
      try {
        const results = await Check.destroy({
          image: image
        }).fetch()

        sails.log.info(`[ok][model-docker-image] Destroyed DockerImage ${image} and ${results.length || 0} checks.`)
      } catch (error) {
        sails.log.error(error)
        sails.log.info(`[!][model-docker-image] Destroyed DockerImage ${image} but not related checks.`)
      }
    }

    return proceed()
  }
}
