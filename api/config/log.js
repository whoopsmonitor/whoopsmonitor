/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * https://sailsjs.com/docs/concepts/logging
 */

const APP_NAME = process.env.APP_NAME || ''
const { version } = require('../package');

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, label, printf, align } = format;
const { SPLAT } = require('triple-beam');
const { isObject } = require('lodash');

function formatObject(param) {
  if (isObject(param)) {
    return JSON.stringify(param);
  }
  return param;
}

// Ignore log messages if they have { private: true }
const all = format((info) => {
  const splat = info[SPLAT] || [];
  const message = formatObject(info.message);
  const rest = splat.map(formatObject).join(' ');
  info.message = `${message} ${rest}`;
  return info;
});

const customLogger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    all(),
    label({ label: version }),
    label({ label: APP_NAME }),
    timestamp(),
    colorize(),
    align(),
    printf(
      (info) =>
        `${info.timestamp} [${info.label}] ${info.level}: ${formatObject(
          info.message
        )}`
    )
  ),
  transports: [new transports.Console()],
});

module.exports.log = {
  custom: customLogger,
  inspect: false
};
