'use strict'
/* global appDeployConfig */

module.exports = (function () {
  const fs = require('fs-extra')
  const async = require('async')
  const path = require('path')
  const sqlSVC = require('../sql/sql-service')

  const deleteApplicationTarballs = (applicationId) => {
    return sqlSVC.selectApplicationReleaseIds(applicationId)
      .then((releaseIds) => {
        return new Promise((resolve, reject) => {
          const eachId = (id, cb) => {
            let releasePath = path.join(appDeployConfig.environment.tarballPath, '' + id)
            fs.remove(releasePath)
              .then(() => cb())
              .catch(cb)
          }

          const loopDone = (err) => {
            if (err) return reject(err)
            resolve()
          }

          async.eachSeries(releaseIds, eachId, loopDone)
        })
      })
  }

  const deleteApplicationReleases = (applicationId) => {
    return deleteApplicationTarballs(applicationId)
      .then(() => sqlSVC.deleteApplicationReleases(applicationId))
  }

  var mod = {
    deleteApplicationReleases: deleteApplicationReleases,
    deleteApplicationTarballs: deleteApplicationTarballs
  }

  return mod
}())
