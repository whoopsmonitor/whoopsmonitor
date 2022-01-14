import { axiosFnc } from '../boot/axios'
import { $whoopsNotify } from '../boot/notify'

const runNow = async function (check) {
  try {
    const $axios = await axiosFnc()
    await $axios.get(`/v1/check/${check.id}/run`)

    $whoopsNotify.positive({
      message: 'Check added to queue.'
    })
  } catch (error) {
    console.error(error)
    $whoopsNotify.negative({
      message: 'It is not possible to run the check. Please try it again.'
    })
  }
}

const switchStatus = async function (opts) {
  const $axios = await axiosFnc()

  if (typeof opts.onBefore === 'function') {
    opts.onBefore()
  }

  try {
    // update state
    await $axios.patch(`/v1/check/${opts.check.id}`, {
      enabled: !opts.check.enabled
    }, {
      params: {
        select: 'enabled'
      }
    })

    if (typeof opts.onSuccess === 'function') {
      opts.onSuccess()
    }
  } catch (error) {
    console.error(error)

    if (typeof opts.onError === 'function') {
      opts.onError(error)
    }
  }
}

export {
  runNow,
  switchStatus
}
