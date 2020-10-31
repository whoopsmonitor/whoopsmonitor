const { DateTime } = require('luxon')

export default (timestamp) => {
  const date = DateTime.fromMillis(timestamp)
  return date.toLocaleString(DateTime.DATETIME_MED)
}
