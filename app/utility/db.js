'use strict'

module.exports = (function () {
  const sqlite3 = require('sqlite3')
  const winston = require('winston')

  const dbFile = '/tmp/app-deployer'

  // The DB connection
  const db = {
    connection: null
  }

  const prepDB = () => {
    return new Promise((resolve, reject) => {
      db.connection = new sqlite3.Database(dbFile)

      // Now see if the database schema is set
      db.connection.serialize(() => {
        db.connection.get("SELECT name FROM sqlite_master WHERE type='table' AND name='applications';", (err, row) => {
          if (err) { return reject(err) }
          if (!row) {
            winston.log('info', 'Need to create the applications table')
            db.connection.run('CREATE TABLE applications (name TEXT)', (err) => {
              if (err) { return reject(err) }
            })
          }
        })
        db.connection.get("SELECT name FROM sqlite_master WHERE type='table' AND name='roles';", (err, row) => {
          if (err) { return reject(err) }
          if (!row) {
            winston.log('info', 'Need to create the roles table')
            db.connection.run('CREATE TABLE roles (application_id INTEGER, role TEXT, active_server TEXT)', (err) => {
              if (err) { return reject(err) }
            })
          }
        })
        db.connection.get("SELECT name FROM sqlite_master WHERE type='table' AND name='deployments';", (err, row) => {
          if (err) { return reject(err) }
          if (!row) {
            winston.log('info', 'Need to create the deployments table')
            db.connection.run('CREATE TABLE deployments (release_id INTEGER, role_id INTEGER, deploy_at INTEGER, status INTEGER, created_at INTEGER)', (err) => {
              if (err) { return reject(err) }
            })
          }
        })
        db.connection.get("SELECT name FROM sqlite_master WHERE type='table' AND name='releases';", (err, row) => {
          if (err) { return reject(err) }
          if (!row) {
            winston.log('info', 'Need to create the releases table')
            db.connection.run('CREATE TABLE releases (application_id INTEGER, version TEXT, tarball TEXT, created_at INTEGER)', (err) => {
              if (err) { return reject(err) }
            })
          }
        })
        resolve()
      })
    })
  }

  var mod = {
    prepDB: prepDB,
    db: db
  }

  return mod
}())
