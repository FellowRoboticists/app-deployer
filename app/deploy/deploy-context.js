'use strict'
/* global appDeployConfig */

module.exports = (function () {
  const winston = require('winston')
  const sqlSVC = require('../sql/sql-service')
  const TimeWindow = require('time-window')
  const jwt = require('jsonwebtoken')
  // const deploySVC = require('./deploy-service')

  const getDeployments = (queryParameters) => {
    return sqlSVC.selectDeployments(queryParameters.release_id, queryParameters.role_id)
  }

  const createDeployment = (deployParams, userId) => {
    return sqlSVC.insertDeployment(deployParams.release_id, deployParams.role_id, userId)
      .then(() => sqlSVC.selectLatestDeployment())
  }

  const _identifyTimeWindow = (timeWindow, overrideToken) => {
    return new Promise((resolve, reject) => {
      if (overrideToken) {
        let payload = null
        try {
          payload = jwt.verify(overrideToken, appDeployConfig.environment.jwtSecret)
        } catch (ex) {
          return reject(ex)
        }
        if (payload.time_window) {
          resolve(payload.time_window)
        } else {
          reject(new Error('No time_window in override token'))
        }
      } else {
        resolve(timeWindow)
      }
    })
  }

  const _withinMaintenanceWindow = (timeWindow, deployment, enforceTw) => {
    winston.log('info', `### timeWindow = ${timeWindow}`)
    winston.log('info', `### overrideToken = ${deployment.override_token}`)
    winston.log('info', `### enforctTw = ${enforceTw}`)
    if (!enforceTw) return Promise.resolve(true)

    return _identifyTimeWindow(timeWindow, deployment.override_token)
      .then((timeWindow) => {
        winston.log('info', `### Time Window Chosen: ${timeWindow}`)
        if (!timeWindow) return true
        let tw = new TimeWindow(timeWindow)
        return tw.inTimeWindow()
      })
  }

  const _executePlaybook = (playbook) => {
    winston.log('info', `### Running playbook: ${playbook}`)
    return Promise.resolve()
  }

  const _runDeployWorkflow = (deployment, timeWindow, userId) => {
    deployment.step += 1
    return sqlSVC.selectWorkflowByRoleSequence(deployment.role_id, deployment.step)
      .then((wfStep) => {
        if (!wfStep) throw new Error(`No step ${deployment.step} for role ${deployment.role_id}`)

        // First, make sure we're within the time window
        return _withinMaintenanceWindow(timeWindow, deployment, wfStep.enforce_tw)
          .then((inWindow) => {
            if (!inWindow) {
              winston.log('info', '### Outside maintenance window')
              deployment.status = 2
              deployment.message = 'Attempted deployment outside maintenance window'
              return sqlSVC.updateDeploymentStatus(deployment.id, deployment.status, deployment.message)
                .then(() => deployment)
            }

            return _executePlaybook(wfStep.playbook)
              .then(() => {
                return sqlSVC.updateDeploymentIncrementStep(deployment.id, userId)
                  .then(() => {
                    if (wfStep.pause_after || wfStep.final) {
                      return deployment
                    } else {
                      return _runDeployWorkflow(deployment, timeWindow, userId)
                    }
                  })
              })
              .catch((err) => {
                deployment.status = 2
                deployment.message = `Error executing playbook (${wfStep.playbook}): ${err.message}`
                return sqlSVC.updateDeploymentStatus(deployment.id, deployment.status, deployment.message)
                  .then(() => deployment)
              })
          })
      })
  }

  const doDeployment = (application, appVersion, role, userId) => {
    let timeWindow = null
    return sqlSVC.selectApplicationReleaseByNameVersion(application, appVersion)
      .then((appRelease) => {
        if (!appRelease) throw new Error(`There is no release version ${appVersion} for ${application}`)
        return sqlSVC.selectApplicationRoleByAppRole(application, role)
          .then((appRole) => {
            if (!appRole) throw new Error(`There is no '${role}' for ${application}`)
            timeWindow = appRole.time_window
            return sqlSVC.selectDeploymentByRoleRelease(appRelease.release_id, appRole.role_id)
              .then((deployment) => {
                if (!deployment) {
                  return sqlSVC.insertDeployment(appRelease.release_id, appRole.role_id, userId)
                    .then(() => sqlSVC.selectLatestDeployment())
                } else {
                  return deployment
                }
              })
          })
      })
      .then((deployment) => _runDeployWorkflow(deployment, timeWindow, userId))
  }

  const _createOverrideToken = (timeWindow) => {
    return new Promise((resolve, reject) => {
      let payload = {
        time_window: timeWindow
      }
      let token = jwt.sign(payload, appDeployConfig.environment.jwtSecret, { expiresIn: 60 * 60 * 24 })
      resolve(token)
    })
  }

  const overrideTimeWindow = (application, appVersion, role, timeWindow, userId) => {
    return sqlSVC.selectApplicationReleaseByNameVersion(application, appVersion)
      .then((appRelease) => {
        if (!appRelease) throw new Error(`There is no release version ${appVersion} for ${application}`)
        return sqlSVC.selectApplicationRoleByAppRole(application, role)
          .then((appRole) => {
            if (!appRole) throw new Error(`There is no '${role}' for ${application}`)
            return sqlSVC.selectDeploymentByRoleRelease(appRelease.release_id, appRole.role_id)
              .then((deployment) => {
                return _createOverrideToken(timeWindow)
                  .then((token) => sqlSVC.updateDeploymentOverrideToken(deployment.id, token))
                  .then(() => deployment)
              })
          })
      })
  }

  var mod = {
    createDeployment: createDeployment,
    doDeployment: doDeployment,
    getDeployments: getDeployments,
    overrideTimeWindow: overrideTimeWindow
  }

  return mod
}())
