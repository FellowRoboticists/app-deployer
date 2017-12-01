'use strict'
/* global appDeployConfig */

module.exports = (function () {
  const sqlite3 = require('sqlite3')
  const path = require('path')

  const dbFile = path.join(appDeployConfig.environment.dbPath, 'app-deployer')

  // The DB connection
  const db = {
    connection: new sqlite3.Database(dbFile)
  }

  const conn = () => {
    return db.connection
  }

  var mod = {
    conn: conn,
    db: db
  }

  return mod
}())
