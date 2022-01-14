import { Notify } from 'quasar'

const $whoopsNotify = {
  negative ({ message, actions }) {
    Notify.create({
      message,
      color: 'red',
      actions
    })
  },
  positive ({ message, actions }) {
    Notify.create({
      message,
      color: 'positive',
      actions
    })
  }
}

export default ({ Vue }) => {
  Vue.prototype.$whoopsNotify = $whoopsNotify
}

export { $whoopsNotify }
