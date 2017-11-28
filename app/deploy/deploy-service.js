'use strict'

/* global appDeployConfig */

module.exports = (function () {
  const path = require('path')
  const fs = require('fs-extra')
  const async = require('async')
  const sqlSVC = require('../sql/sql-service')

  const _registerDeployments = (roles, releaseId, deployAt) => {
    return new Promise((resolve, reject) => {
      const eachRole = (role, cb) => {
        sqlSVC.insertDeployment(releaseId, role, deployAt)
          .then(() => cb())
          .catch(cb)
      }

      const loopDone = (err) => {
        if (err) return reject(err)
        resolve()
      }

      async.eachSeries(roles, eachRole, loopDone)
    })
  }

  const registerRelease = (tarballName, deployParams) => {
    return sqlSVC.insertRelease(deployParams.application_id, deployParams.version, tarballName)
      .then(() => sqlSVC.selectLatestApplicationRelease(deployParams.application_id))
      .then((release) => {
        if (deployParams.role instanceof Array) {
          return _registerDeployments(deployParams.role, release.id, deployParams.deploy_at)
            .then(() => release)
        } else {
          return sqlSVC.insertDeployment(release.id, deployParams.role, deployParams.deploy_at)
            .then(() => release)
        }
      })
  }

  const deleteTarball = (releaseId) => {
    let tarballPath = path.join(appDeployConfig.environment.tarballPath, '' + releaseId)
    return fs.remove(tarballPath)
  }

  const saveTarball = (uploadedTarball, releaseId) => {
    let tarballPath = path.join(appDeployConfig.environment.tarballPath, '' + releaseId, uploadedTarball.originalname)
    return fs.ensureDir(path.join(appDeployConfig.environment.tarballPath, '' + releaseId))
      .then(() => fs.copy(uploadedTarball.path, tarballPath))
      .then(() => fs.remove(uploadedTarball.path))
      .then(() => tarballPath)
  }

  const deleteReleaseDeployments = (releaseId) => {
    return sqlSVC.deleteReleaseDeployments(releaseId)
  }

  const deleteRoleDeployments = (roleId) => {
    return sqlSVC.deleteRoleDeployments(roleId)
  }

  var mod = {
    deleteReleaseDeployments: deleteReleaseDeployments,
    deleteRoleDeployments: deleteRoleDeployments,
    deleteTarball: deleteTarball,
    registerRelease: registerRelease,
    saveTarball: saveTarball
  }

  return mod
}())
