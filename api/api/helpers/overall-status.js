module.exports = {

  friendlyName: 'Overall status for the app.',

  description: '',

  inputs: {
  },

  exits: {
  },

  fn: async function (inputs, exits) {
    let overall = {
      issues: 0,
      output: []
    }

    try {
      // find unhealthy images
      const images = await DockerImage.find({
        where: {
          healthyStatus: {
            '>': 0
          },
        },
        select: ['image', 'healthyStatusOutput'],
      })

      if (images.length) {
        ++overall.issues

        for (const image of images) {
          overall.output.push(`Image '${image.image}' corrupted. Error: ${image.healthyStatusOutput}`)
        }

        failed = true
      }

    } catch (error) {
      if (error) {
        // error is not interesting here
      }

      // somethins is cardinally wrong
      overall.issues = 1000
      overall.output.push('Internal Server Error.')
      overall.output.push('error')
    }


    return exits.success(overall)
  }
}
