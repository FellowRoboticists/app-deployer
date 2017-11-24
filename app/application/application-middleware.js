'use strict'

module.exports = (function () {
  const dBase = require('../utility/db')

  const appSelectSQL = `
  SELECT 
    rowid AS id, 
    name 
  FROM 
    applications WHERE rowid = ?`

  const roleSelectSQL = `
  SELECT 
    rowid AS id, 
    application_id, 
    role, 
    active_server 
  FROM 
    roles 
  WHERE 
    rowid = ?`

  const applicationIdParam = function __applicationIdParam (req, res, next, id) {
    dBase.db.connection.all(appSelectSQL, id, (err, rows) => {
      if (err) return next(err)
      req.application = rows[0]
      next()
    })
  }

  const roleIdParam = function __roleIdParam (req, res, next, id) {
    let params = [ id ]
    let sql = roleSelectSQL
    if (req.application) {
      sql += ' AND application_id = ?'
      params.push(req.application.id)
    }

    dBase.db.connection.all(sql, ...params, (err, rows) => {
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
