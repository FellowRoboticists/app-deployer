'use strict'

/* global appDeployConfig */

module.exports = (function () {
  const dbConn = require('../utility/db').conn()
  const path = require('path')
  const fs = require('fs-extra')

  const insertReleaseSQL = `
    INSERT INTO releases (
      application_id, version, tarball, created_at
    ) VALUES (
      ?, ?, ?, DATETIME('now')
    )`

  const selectReleaseSQL = `
    SELECT 
      rowid AS id, 
      application_id, 
      version, 
      tarball, 
      created_at 
    FROM 
      releases 
    WHERE 
      application_id = ? 
    ORDER BY 
      rowid DESC 
    LIMIT 1`

  const insertDeploymentSQL = `
    INSERT INTO deployments (
      release_id, role_id, deploy_at, status, created_at
    ) VALUES (
      ?,?,?,0,DATETIME('now')
    )`

  const registerRelease = (tarballName, deployParams) => {
    return new Promise((resolve, reject) => {
      dbConn.run(insertReleaseSQL, deployParams.application_id, deployParams.version, tarballName, (err) => {
        if (err) return reject(err)
        dbConn.all(selectReleaseSQL, deployParams.application_id, (err, rows) => {
          if (err) return reject(err)
          let release = rows[0]
          dbConn.serialize(() => {
            let deploymentSQL = dbConn.prepare(insertDeploymentSQL)
            if (deployParams.role instanceof Array) {
              for (let rid of deployParams.role) {
                deploymentSQL.run(release.id, rid, deployParams.deploy_at)
              }
            } else {
              deploymentSQL.run(release.id, deployParams.role, deployParams.deploy_at)
            }
            deploymentSQL.finalize()
            resolve(release)
          })
        })
      })
    })
  }

  const saveTarball = (uploadedTarball, releaseId) => {
    let tarballPath = path.join(appDeployConfig.environment.tarballPath, '' + releaseId, uploadedTarball.originalname)
    return fs.ensureDir(path.join(appDeployConfig.environment.tarballPath, '' + releaseId))
      .then(() => fs.copy(uploadedTarball.path, tarballPath))
      .then(() => tarballPath)
  }

  var mod = {
    registerRelease: registerRelease,
    saveTarball: saveTarball
  }

  return mod
}())
