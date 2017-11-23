'use strict'

module.exports = (function () {
  const deploySVC = require('./deploy-service')

  const createDeployment = (uploadedTarball, deployParams) => {
    return deploySVC.registerRelease(uploadedTarball.originalname, deployParams)
      .then((release) => {
        return deploySVC.saveTarball(uploadedTarball, release.id)
          .then((fullPath) => release)
      })
  }

  var mod = {
    createDeployment: createDeployment
  }

  return mod
}())
