'use strict'
/* global appDeployConfig */

module.exports = (function () {
  const fs = require('fs-extra')
  const path = require('path')
  const sqlSVC = require('../sql/sql-service')

  const deleteApplicationTarballs = async (applicationId) => {
    let releaseIds = await sqlSVC.selectApplicationReleaseIds(applicationId)

    for (let id of releaseIds) {
      let releasePath = path.join(appDeployConfig.environment.tarballPath, '' + id)
      await fs.remove(releasePath)
    }
  }

  const deleteApplicationReleases = async (applicationId) => {
    await deleteApplicationTarballs(applicationId)

    return sqlSVC.deleteApplicationReleases(applicationId)
  }

  var mod = {
    deleteApplicationReleases: deleteApplicationReleases,
    deleteApplicationTarballs: deleteApplicationTarballs
  }

  return mod
}())
