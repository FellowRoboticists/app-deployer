'use strict'

module.exports = (function () {
  var mod = {
    dbPath: process.env.DB_PATH ? process.env.DB_PATH : '/tmp',
    tarballPath: process.env.TARBALL_PATH ? process.env.TARBALL_PATH : '/tmp'
  }

  return mod
}())