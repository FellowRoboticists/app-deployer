'use strict'

const express = require('express')
const router = express.Router()

const workflowCTX = require('./workflow-context')
const workflowMW = require('./workflow-middleware')
const sessionMW = require('../session/session-middleware')
const generalMW = require('../utility/general-middleware')

router.param('workflow', workflowMW.workflowIdParam)

router.get(
  '/',
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer', 'reporter']),
  function __getWorkflows (req, res, next) {
    workflowCTX.getWorkflows(req.query)
      .then((workflows) => res.json(workflows))
      .catch(next)
  }
)

router.get(
  `/:workflow(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer', 'reporter']),
  function __getWorkflow (req, res, next) {
    res.json(req.workflow)
  }
)

router.post(
  '/',
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin']),
  function __createWorkflow (req, res, next) {
    workflowCTX.createWorkflow(req.body)
      .then((workflow) => res.json(workflow))
      .catch(next)
  }
)

router.put(
  `/:workflow(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin']),
  function __updateWorkflow (req, res, next) {
    workflowCTX.updateWorkflow(req.workflow, req.body)
      .then((workflow) => res.json(workflow))
      .catch(next)
  }
)

router.delete(
  `/:workflow(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin']),
  function __deleteWorkflow (req, res, next) {
    workflowCTX.deleteWorkflow(req.workflow)
      .then((workflow) => res.json(workflow))
      .catch(next)
  }
)

module.exports = router
