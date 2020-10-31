import cronstrue from 'cronstrue'
import { isValidCron } from 'cron-validator'

export default (cron) => {
  if (isValidCron(cron, { seconds: true })) {
    return cronstrue.toString(cron)
  }

  return cron
}
