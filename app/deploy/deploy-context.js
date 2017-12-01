'use strict'

module.exports = (function () {
  const winston = require('winston')
  const sqlSVC = require('../sql/sql-service')
  // const deploySVC = require('./deploy-service')

  const getDeployments = (queryParameters) => {
    return sqlSVC.selectDeployments(queryParameters.release_id, queryParameters.role_id)
  }

  const createDeployment = (deployParams) => {
    return sqlSVC.insertDeployment(deployParams.release_id, deployParams.role_id)
      .then(() => sqlSVC.selectLatestDeployment())
  }

  const _runDeployWorkflow = (deployment) => {
    deployment.step += 1
    return sqlSVC.selectWorkflowByRoleSequence(deployment.role_id, deployment.step)
      .then((wfStep) => {
        if (!wfStep) throw new Error(`No step ${deployment.step} for role ${deployment.role_id}`)

        winston.log('info', `### Running playbook: ${wfStep.playbook}`)
        return sqlSVC.updateDeploymentIncrementStep(deployment.id)
          .then(() => {
            if (wfStep.pause_after || wfStep.final) {
              return deployment
            } else {
              return _runDeployWorkflow(deployment)
            }
          })
      })
  }

  const doDeployment = (application, appVersion, role) => {
    return sqlSVC.selectApplicationReleaseByNameVersion(application, appVersion)
      .then((appRelease) => {
        if (!appRelease) throw new Error(`There is no release version ${appVersion} for ${application}`)
        return sqlSVC.selectApplicationRoleByAppRole(application, role)
          .then((appRole) => {
            if (!appRole) throw new Error(`There is no '${role}' for ${application}`)
            return sqlSVC.selectDeploymentByRoleRelease(appRelease.release_id, appRole.role_id)
              .then((deployment) => {
                if (!deployment) {
                  return sqlSVC.insertDeployment(appRelease.release_id, appRole.role_id)
                    .then(() => sqlSVC.selectLatestDeployment())
                } else {
                  return deployment
                }
              })
          })
      })
      .then((deployment) => _runDeployWorkflow(deployment))
  }

  var mod = {
    createDeployment: createDeployment,
    doDeployment: doDeployment,
    getDeployments: getDeployments
  }

  return mod
}())
