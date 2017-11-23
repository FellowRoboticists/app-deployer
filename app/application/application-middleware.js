'use strict'

module.exports = (function () {
  const dBase = require('../utility/db')

  const applicationIdParam = function __applicationIdParam (req, res, next, id) {
    dBase.db.connection.all('SELECT rowid AS id, name FROM applications WHERE rowid = ?', id, (err, rows) => {
      if (err) return next(err)
      req.application = rows[0]
      next()
    })
  }

  const roleIdParam = function __roleIdParam (req, res, next, id) {
    dBase.db.connection.all('SELECT rowid AS id, application_id, role, active_server FROM roles WHERE application_id = ? AND rowid = ?', req.application.id, id, (err, rows) => {
      if (err) return next(err)
      req.role = rows[0]
      next()
    })
  }

  var mod = {
    applicationIdParam: applicationIdParam,
    roleIdParam: roleIdParam
  }

  return mod
}())
