import { Notify } from 'quasar'

const $whoopsNotify = {
  negative ({ message, actions }) {
    Notify.create({
      message,
      html: true,
      color: 'red',
      actions
    })
  },
  positive ({ message, actions }) {
    Notify.create({
      message,
      html: true,
      color: 'positive',
      actions
    })
  }
}

export default ({ Vue }) => {
  Vue.prototype.$whoopsNotify = $whoopsNotify
}

export { $whoopsNotify }
