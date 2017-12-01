'use strict'

module.exports = (function () {
  const deploySVC = require('../deploy/deploy-service')
  const releaseSVC = require('../release/release-service')
  const sqlSVC = require('../sql/sql-service')

  const createApplication = (applicationParams) => {
    return sqlSVC.insertApplication(applicationParams.name)
      .then(() => sqlSVC.selectLatestApplication())
  }

  const deleteApplication = (application) => {
    return releaseSVC.deleteApplicationTarballs(application.id)
      .then(() => sqlSVC.deleteApplications(application.id))
      .then(() => application)
  }

  const getApplications = () => {
    return sqlSVC.selectAllApplications()
  }

  const updateApplication = (application, params) => {
    return sqlSVC.updateApplication(application.id, params)
      .then(() => sqlSVC.selectApplicationById(application.id))
  }

  const getApplicationReleases = (application) => {
    return sqlSVC.selectApplicationReleases(application.id)
  }

  const getApplicationRoles = (application) => {
    return sqlSVC.selectApplicationRoles(application.id)
  }

  const createApplicationRelease = (application, uploadedTarball, uploadedSeedfile, releaseParams) => {
    let seedFileName = uploadedSeedfile ? uploadedSeedfile.originalname : null
    return sqlSVC.insertRelease(releaseParams.application_id, releaseParams.version, uploadedTarball.originalname, seedFileName)
      .then(() => sqlSVC.selectLatestApplicationRelease(releaseParams.application_id))
      .then((release) => {
        return deploySVC.saveTarball(uploadedTarball, release.id)
          .then((fullPath) => {
            if (uploadedSeedfile) {
              return deploySVC.saveSeedfile(uploadedSeedfile, release.id)
                .then((fullPath) => release)
            } else {
              return release
            }
          })
      })
  }

  const createApplicationRole = (application, roleParams) => {
    return sqlSVC.insertApplicationRole(application.id, roleParams)
      .then(() => sqlSVC.selectLatestApplicationRole(application.id))
  }

  const updateApplicationRelease = (application, release, releaseParams) => {
    return sqlSVC.updateApplicationRelease(application.id, release.id, releaseParams)
      .then(() => sqlSVC.selectApplicationReleaseById(release.id))
  }

  const updateApplicationRole = (application, role, roleParams) => {
    return sqlSVC.updateApplicationRole(application.id, role.id, roleParams)
      .then(() => sqlSVC.selectApplicationRoleById(role.id))
  }

  const deleteApplicationRelease = (release) => {
    return sqlSVC.deleteApplicationRelease(release.id)
      .then(() => deploySVC.deleteTarball(release.id))
      .then(() => release)
  }

  const deleteApplicationRole = (role) => {
    return sqlSVC.deleteApplicationRole(role.id)
      .then(() => role)
  }

  var mod = {
    createApplication: createApplication,
    createApplicationRelease: createApplicationRelease,
    createApplicationRole: createApplicationRole,
    deleteApplication: deleteApplication,
    deleteApplicationRelease: deleteApplicationRelease,
    deleteApplicationRole: deleteApplicationRole,
    getApplicationReleases: getApplicationReleases,
    getApplicationRoles: getApplicationRoles,
    getApplications: getApplications,
    updateApplication: updateApplication,
    updateApplicationRelease: updateApplicationRelease,
    updateApplicationRole: updateApplicationRole
  }

  return mod
}())
