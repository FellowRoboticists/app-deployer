'use strict'
/* global appDeployConfig */

module.exports = (function () {
  const winston = require('winston')
  const sqlSVC = require('../sql/sql-service')
  const TimeWindow = require('time-window')
  const jwt = require('jsonwebtoken')

  const getDeployments = async (queryParameters) => {
    return sqlSVC.selectDeployments(queryParameters.release_id, queryParameters.role_id)
  }

  const createDeployment = async (deployParams, userId) => {
    await sqlSVC.insertDeployment(deployParams.release_id, deployParams.role_id, userId)

    return sqlSVC.selectLatestDeployment()
  }

  const _identifyTimeWindow = async (timeWindow, overrideToken) => {
    if (overrideToken) {
      let payload = jwt.verify(overrideToken, appDeployConfig.environment.jwtSecret)

      if (payload.time_window) {
        return payload.time_window
      } else {
        throw new Error('No time_window in override token')
      }
    } else {
      return timeWindow
    }
  }

  const _withinMaintenanceWindow = async (timeWindow, deployment, enforceTw) => {
    winston.log('info', `### timeWindow = ${timeWindow}`)
    winston.log('info', `### overrideToken = ${deployment.override_token}`)
    winston.log('info', `### enforctTw = ${enforceTw}`)

    if (!enforceTw) return true

    let idTimeWindow = _identifyTimeWindow(timeWindow, deployment.override_token)

    winston.log('info', `### Time Window Chosen: ${timeWindow}`)
    if (!idTimeWindow) return true

    let tw = new TimeWindow(idTimeWindow)

    return tw.inTimeWindow()
  }

  const _executePlaybook = async (playbook) => {
    winston.log('info', `### Running playbook: ${playbook}`)
  }

  const _runDeployWorkflow = async (deployment, releaseInfo, userId) => {
    deployment.step += 1

    let wfStep = await sqlSVC.selectWorkflowByRoleSequence(deployment.role_id, deployment.step)

    if (!wfStep) throw new Error(`No step ${deployment.step} for role ${deployment.role_id}`)

    // First, make sure we're within the time window
    let inWindow = await _withinMaintenanceWindow(releaseInfo.time_window, deployment, wfStep.enforce_tw)

    if (!inWindow) {
      winston.log('info', '### Outside maintenance window')
      deployment.status = 2
      deployment.message = 'Attempted deployment outside maintenance window'

      await sqlSVC.updateDeploymentStatus(deployment.id, deployment.status, deployment.message)
      return deployment
    }

    try {
      await _executePlaybook(wfStep.playbook)

      await sqlSVC.updateDeploymentIncrementStep(deployment.id, userId)

      if (wfStep.pause_after || wfStep.final) {
        return deployment
      } else {
        return _runDeployWorkflow(deployment, releaseInfo, userId)
      }
    } catch (err) {
      deployment.status = 2
      deployment.message = `Error executing playbook (${wfStep.playbook}): ${err.message}`

      await sqlSVC.updateDeploymentStatus(deployment.id, deployment.status, deployment.message)

      return deployment
    }
  }

  const doDeployment = async (application, appVersion, role, userId) => {
    let releaseInfo = await sqlSVC.selectReleaseInfo(application, appVersion, role)

    let deployment = await sqlSVC.selectDeploymentByRoleRelease(releaseInfo.release_id, releaseInfo.role_id)

    if (!deployment) {
      await sqlSVC.insertDeployment(releaseInfo.release_id, releaseInfo.role_id, userId)
      deployment = await sqlSVC.selectLatestDeployment()
    }

    return _runDeployWorkflow(deployment, releaseInfo, userId)
  }

  const _createOverrideToken = async (timeWindow) => {
    let payload = {
      time_window: timeWindow
    }

    return jwt.sign(payload, appDeployConfig.environment.jwtSecret, { expiresIn: 60 * 60 * 24 })
  }

  const overrideTimeWindow = async (application, appVersion, role, timeWindow, userId) => {
    let releaseInfo = await sqlSVC.selectReleaseInfo(application, appVersion, role)

    let deployment = await sqlSVC.selectDeploymentByRoleRelease(releaseInfo.release_id, releaseInfo.role_id)

    let token = await _createOverrideToken(timeWindow)
    await sqlSVC.updateDeploymentOverrideToken(deployment.id, token)

    return deployment
  }

  var mod = {
    createDeployment: createDeployment,
    doDeployment: doDeployment,
    getDeployments: getDeployments,
    overrideTimeWindow: overrideTimeWindow
  }

  return mod
}())
