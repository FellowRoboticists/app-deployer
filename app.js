'use strict'

const express = require('express')
const winston = require('winston')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const path = require('path')
const logging = require('./logging')

// Just the base-level logging
logging.baseLogging()

require('./bootstrap')

const sqlSVC = require('./app/sql/sql-service')

sqlSVC.prepDB()
  .then(() => winston.log('info', 'db prepped'))
  .catch((err) => winston.error('error', err.stack || err))

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

logging.expressLogging(app)

app.use('/deployments', require('./app/deploy/deploy-controller'))
app.use('/applications', require('./app/application/application-controller'))
app.use('/reports', require('./app/report/report-controller'))
app.use('/sessions', require('./app/session/session-controller'))
app.use('/users', require('./app/user/user-controller'))
app.use('/workflows', require('./app/workflow/workflow-controller'))

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json({'error': err.stack || err})
})

module.exports = app
