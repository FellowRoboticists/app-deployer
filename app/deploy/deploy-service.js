'use strict'

/* global appDeployConfig */

module.exports = (function () {
  const path = require('path')
  const fs = require('fs-extra')
  const sqlSVC = require('../sql/sql-service')

  const _registerDeployments = async (roles, releaseId, deployAt) => {
    for (let role of roles) {
      await sqlSVC.insertDeployment(releaseId, role, deployAt)
    }
  }

  const registerRelease = async (tarballName, deployParams) => {
    await sqlSVC.insertRelease(deployParams.application_id, deployParams.version, tarballName)
    let release = await sqlSVC.selectLatestApplicationRelease(deployParams.application_id)

    if (deployParams.role instanceof Array) {
      await _registerDeployments(deployParams.role, release.id, deployParams.deploy_at)
    } else {
      await sqlSVC.insertDeployment(release.id, deployParams.role, deployParams.deploy_at)
    }

    return release
  }

  const deleteTarball = async (releaseId) => {
    let tarballPath = path.join(appDeployConfig.environment.tarballPath, '' + releaseId)

    return fs.remove(tarballPath)
  }

  const saveTarball = async (uploadedTarball, releaseId) => {
    let tarballPath = path.join(appDeployConfig.environment.tarballPath, '' + releaseId, uploadedTarball.originalname)

    await fs.ensureDir(path.join(appDeployConfig.environment.tarballPath, '' + releaseId))
    await fs.copy(uploadedTarball.path, tarballPath)
    await fs.remove(uploadedTarball.path)

    return tarballPath
  }

  const saveSeedfile = async (uploadedSeedfile, releaseId) => {
    let seedfilePath = path.join(appDeployConfig.environment.tarballPath, '' + releaseId, uploadedSeedfile.originalname)

    await fs.ensureDir(path.join(appDeployConfig.environment.tarballPath, '' + releaseId))
    await fs.copy(uploadedSeedfile.path, seedfilePath)
    await fs.remove(uploadedSeedfile.path)

    return seedfilePath
  }

  const deleteReleaseDeployments = async (releaseId) => {
    return sqlSVC.deleteReleaseDeployments(releaseId)
  }

  const deleteRoleDeployments = async (roleId) => {
    return sqlSVC.deleteRoleDeployments(roleId)
  }

  var mod = {
    deleteReleaseDeployments: deleteReleaseDeployments,
    deleteRoleDeployments: deleteRoleDeployments,
    deleteTarball: deleteTarball,
    registerRelease: registerRelease,
    saveSeedfile: saveSeedfile,
    saveTarball: saveTarball
  }

  return mod
}())
