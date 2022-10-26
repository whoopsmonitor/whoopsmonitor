module.exports = {

  friendlyName: 'Get all tags',

  inputs: {
  },

  exits: {
    badRequest: {
      responseType: 'badRequest'
    }
  },

  fn: async function (_, exits) {
    try {
      const checks = await Check.find({
        select: 'tags'
      })

      let tags = []

      for (const check of checks) {
        if (check.tags) {
          tags = [...new Set([...tags, ...check.tags])]
        }
      }

      return exits.success(tags)
    } catch (error) {
      if (error) {
        return exits.badRequest()
      }
    }
    return exits.success(true)
  }
}
