'use strict'

const express = require('express')
const router = express.Router()

const sessionMW = require('../session/session-middleware')
const generalMW = require('../utility/general-middleware')
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

module.exports = router
