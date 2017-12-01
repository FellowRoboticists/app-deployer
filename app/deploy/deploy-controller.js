'use strict'

const express = require('express')
const router = express.Router()

const sessionMW = require('../session/session-middleware')
// const generalMW = require('../utility/general-middleware')
const deployCTX = require('./deploy-context')

router.get(
  '/',
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer', 'reporter']),
  function __getDeployments (req, res, next) {
    deployCTX.getDeployments(req.query)
      .then((deployments) => res.json(deployments))
      .catch(next)
  }
)

router.post(
  '/',
  function __createDeployment (req, res, next) {
    deployCTX.createDeployment(req.body)
      .then((deploy) => res.json(deploy))
      .catch(next)
  }
)

router.post(
  '/deploy',
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer']),
  function __doDeployment (req, res, next) {
    deployCTX.doDeployment(req.body.application, req.body.appVersion, req.body.role)
      .then((deployment) => res.json(deployment))
      .catch(next)
  }
)

module.exports = router
