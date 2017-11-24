'use strict'

module.exports = (function () {
  const dBase = require('../utility/db')

  const baseReleaseReport = `
  SELECT
    app.name AS app_name,
    rel.version,
    rol.role,
    CASE dep.deploy_at
      WHEN 0 THEN 'Deferred'
      WHEN 1 THEN 'Immediate'
      ELSE 'Invalid deploy_at'
    END AS deploy_at,
    CASE dep.status
      WHEN 0 THEN 'New'
      WHEN 1 THEN 'In Process'
      WHEN 2 THEN 'Completed - Success'
      WHEN 3 THEN 'Completed - Error'
      ELSE 'Invalid Status'
    END AS status,
    rel.created_at AS release_created_at,
    dep.created_at AS deploy_created_at
  FROM
    releases AS rel INNER JOIN deployments AS dep ON rel.rowid = dep.release_id
    INNER JOIN applications AS app ON app.rowid = rel.application_id
    INNER JOIN roles AS rol ON rol.rowid = role_id`

  const getApplicationReport = (application) => {
    return new Promise((resolve, reject) => {
      let sql = baseReleaseReport + ' WHERE app.rowid = ?'
      dBase.db.connection.all(sql, application.id, (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
  }

  const getRoleReport = (role) => {
    return new Promise((resolve, reject) => {
      let sql = baseReleaseReport + ' WHERE rol.rowid = ?'
      dBase.db.connection.all(sql, role.id, (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
  }

  var mod = {
    getApplicationReport: getApplicationReport,
    getRoleReport: getRoleReport
  }

  return mod
}())
