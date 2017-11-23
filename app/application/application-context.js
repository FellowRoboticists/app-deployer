'use strict'

module.exports = (function () {
  const dBase = require('../utility/db')
  const winston = require('winston')

  const createApplication = (applicationParams) => {
    return new Promise((resolve, reject) => {
      dBase.db.connection.run('INSERT INTO applications (name) VALUES (?)', applicationParams.name, (err) => {
        if (err) return reject(err)
        dBase.db.connection.all('SELECT rowid AS id, name FROM applications ORDER BY rowid DESC LIMIT 1', (err, rows) => {
          if (err) return reject(err)
          resolve(rows[0])
        })
      })
    })
  }

  const deleteApplication = (application) => {
    return new Promise((resolve, reject) => {
      dBase.db.connection.run('DELETE FROM roles WHERE application_id = ?', application.id, (err) => {
        if (err) return reject(err)
        dBase.db.connection.run('DELETE FROM applications WHERE rowid = ?', application.id, (err) => {
          if (err) return reject(err)
          resolve(application)
        })
      })
    })
  }

  const getApplications = () => {
    return new Promise((resolve, reject) => {
      dBase.db.connection.all('SELECT rowid as id, name FROM applications', (err, rows) => {
        if (err) {
          winston.log('error', err.stack || err)
          return reject(err)
        }
        resolve(rows)
      })
    })
  }

  const updateApplication = (application, params) => {
    return new Promise((resolve, reject) => {
      dBase.db.connection.run('UPDATE applications SET name = ? WHERE rowid = ?', params.name, application.id, (err) => {
        if (err) return reject(err)
        dBase.db.connection.all('SELECT rowid AS id, name FROM applications WHERE rowid = ?', application.id, (err, rows) => {
          if (err) return reject(err)
          resolve(rows[0])
        })
      })
    })
  }

  const getApplicationRoles = (application) => {
    return new Promise((resolve, reject) => {
      dBase.db.connection.all('SELECT rowid AS id, application_id, role, active_server FROM roles WHERE application_id = ?', application.id, (err, rows) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
  }

  const createApplicationRole = (application, roleParams) => {
    return new Promise((resolve, reject) => {
      dBase.db.connection.run('INSERT INTO roles (application_id, role, active_server) VALUES (?, ?, ?)', application.id, roleParams.role, roleParams.active_server, (err) => {
        if (err) return reject(err)
        dBase.db.connection.all('SELECT rowid AS id, application_id, role, active_server FROM roles WHERE application_id = ? ORDER BY rowid DESC LIMIT 1', application.id, (err, rows) => {
          if (err) return reject(err)
          resolve(rows[0])
        })
      })
    })
  }

  const updateApplicationRole = (application, role, roleParams) => {
    return new Promise((resolve, reject) => {
      dBase.db.connection.run('UPDATE roles SET application_id = ?, role = ?, active_server = ? WHERE rowid = ?', application.id, roleParams.role, roleParams.active_server, role.id, (err) => {
        if (err) return reject(err)
        dBase.db.connection.all('SELECT rowid AS id, application_id, role, active_server FROM roles WHERE rowid = ?', role.id, (err, rows) => {
          if (err) return reject(err)
          resolve(rows[0])
        })
      })
    })
  }

  const deleteApplicationRole = (role) => {
    return new Promise((resolve, reject) => {
      dBase.db.connection.run('DELETE FROM roles WHERE rowid = ?', role.id, (err) => {
        if (err) return reject(err)
        resolve(role)
      })
    })
  }

  var mod = {
    createApplication: createApplication,
    createApplicationRole: createApplicationRole,
    deleteApplication: deleteApplication,
    deleteApplicationRole: deleteApplicationRole,
    getApplicationRoles: getApplicationRoles,
    getApplications: getApplications,
    updateApplication: updateApplication,
    updateApplicationRole: updateApplicationRole
  }

  return mod
}())
