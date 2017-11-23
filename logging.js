'use strict'

module.exports = (function () {
  const winston = require('winston')

  const LogLevel = (process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : 'debug'
  const RsyslogOptions = {
    level: LogLevel,
    host: 'localhost',
    port: 514,
    protocol: 'U',
    facility: 19, // 'local3',
    tag: 'Vault' }

  const baseLogging = () => {
    if (process.env.NODE_ENV === 'production') {
      require('winston-rsyslog').Syslog // eslint-disable-line no-unused-expressions

      winston.add(winston.transports.Rsyslog, RsyslogOptions)

      // Don't want to log to console
      winston.remove(winston.transports.Console)
    } else {
      winston.level = LogLevel
    }
  }

  const expressLogging = (app) => {
    const expressWinston = require('express-winston')

    if (process.env.NODE_ENV === 'production') {
      require('winston-rsyslog').Syslog // eslint-disable-line no-unused-expressions

      app.use(expressWinston.logger({
        transports: [
          new winston.transports.Rsyslog(RsyslogOptions)
        ],
        expressFormat: true // Use the default Express/morgan request formatting
      }))
    } else {
      app.use(expressWinston.logger({
        transports: [
          new winston.transports.Console({
            level: LogLevel,
            colorize: true
          })
        ],
        expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
        colorize: true // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
      }))
    }
  }

  var mod = {
    baseLogging: baseLogging,
    expressLogging: expressLogging
  }

  return mod
}())
