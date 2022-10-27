import { $whoopsNotify } from '../boot/notify'

const runNow = async function (check) {
  this.$sailsIo.socket.get(`/v1/check/${check.id}/run`, (_, response) => {
    if (response.statusCode !== 200) {
      $whoopsNotify.negative({
        message: 'It is not possible to run the check. Please try it again.'
      })
      return false
    }

    $whoopsNotify.positive({
      message: 'Check added to queue.'
    })
  })
}

const switchStatus = function (opts) {
  if (typeof opts.onBefore === 'function') {
    opts.onBefore()
  }

  // update state
  opts.this.$sailsIo.socket.patch(`/v1/check/${opts.check.id}`, {
    enabled: !opts.check.enabled
  }, (_, response) => {
    if (response.statusCode !== 200) {
      if (typeof opts.onError === 'function') {
        opts.onError(response)
      }

      return false
    }

    if (typeof opts.onSuccess === 'function') {
      opts.onSuccess()
    }
  })
}

export {
  runNow,
  switchStatus
}
