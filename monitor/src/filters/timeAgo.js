import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
TimeAgo.addLocale(en)

const timeAgo = new TimeAgo('en-US')

export default (timestamp) => {
  return timeAgo.format(timestamp)
}
