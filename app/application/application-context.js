'use strict'

module.exports = (function () {
  const deploySVC = require('../deploy/deploy-service')
  const releaseSVC = require('../release/release-service')
  const sqlSVC = require('../sql/sql-service')

  const createApplication = async (applicationParams) => {
    await sqlSVC.insertApplication(applicationParams.name)

    return sqlSVC.selectLatestApplication()
  }

  const deleteApplication = async (application) => {
    await releaseSVC.deleteApplicationTarballs(application.id)
    await sqlSVC.deleteApplications(application.id)

    return application
  }

  const getApplications = async () => {
    return sqlSVC.selectAllApplications()
  }

  const updateApplication = async (application, params) => {
    await sqlSVC.updateApplication(application.id, params)

    return sqlSVC.selectApplicationById(application.id)
  }

  const getApplicationReleases = async (application) => {
    return sqlSVC.selectApplicationReleases(application.id)
  }

  const getApplicationRoles = async (application) => {
    return sqlSVC.selectApplicationRoles(application.id)
  }

  const createApplicationRelease = async (application, uploadedTarball, uploadedSeedfile, releaseParams, userId) => {
    let seedFileName = uploadedSeedfile ? uploadedSeedfile.originalname : null

    await sqlSVC.insertRelease(releaseParams.application_id, releaseParams.version, uploadedTarball.originalname, seedFileName, userId)

    let release = await sqlSVC.selectLatestApplicationRelease(releaseParams.application_id)

    await deploySVC.saveTarball(uploadedTarball, application.id, release.id)

    if (uploadedSeedfile) {
      await deploySVC.saveSeedfile(uploadedSeedfile, application.id, release.id)
    }

    return release
  }

  const createApplicationRole = async (application, roleParams) => {
    await sqlSVC.insertApplicationRole(application.id, roleParams)

    return sqlSVC.selectLatestApplicationRole(application.id)
  }

  const updateApplicationRelease = async (application, release, releaseParams, userId) => {
    await sqlSVC.updateApplicationRelease(application.id, release.id, releaseParams, userId)

    return sqlSVC.selectApplicationReleaseById(release.id)
  }

  const updateApplicationRole = async (application, role, roleParams) => {
    await sqlSVC.updateApplicationRole(application.id, role.id, roleParams)

    return sqlSVC.selectApplicationRoleById(role.id)
  }

  const deleteApplicationRelease = async (release) => {
    await sqlSVC.deleteApplicationRelease(release.id)
    await deploySVC.deleteTarball(release.application_id, release.id)

    return release
  }

  const deleteApplicationRole = async (role) => {
    await sqlSVC.deleteApplicationRole(role.id)

    return role
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
