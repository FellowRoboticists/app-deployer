'use strict'

var express = require('express')
var router = express.Router()

const applicationCTX = require('./application-context')
const applicationMW = require('./application-middleware')
const generalMW = require('../utility/general-middleware')

router.param('application', applicationMW.applicationIdParam)
router.param('role', applicationMW.roleIdParam)

router.get(
  '/',
  function __getApplications (req, res, next) {
    applicationCTX.getApplications()
      .then((applications) => res.json(applications))
      .catch(next)
  }
)

router.get(
  `/:application(${generalMW.dbId})`,
  function __getApplication (req, res, next) {
    res.json(req.application)
  }
)

router.post(
  '/',
  function __createApplication (req, res, next) {
    applicationCTX.createApplication(req.body)
      .then((application) => res.json(application))
      .catch(next)
  }
)

router.put(
  `/:application(${generalMW.dbId})`,
  function __updateApplication (req, res, next) {
    applicationCTX.updateApplication(req.application, req.body)
      .then((application) => res.json(application))
      .catch(next)
  }
)

router.delete(
  `/:application(${generalMW.dbId})`,
  function __deleteApplication (req, res, next) {
    applicationCTX.deleteApplication(req.application)
      .then((application) => res.json(application))
      .catch(next)
  }
)

router.get(
  `/:application(${generalMW.dbId})/roles`,
  function __getApplicationRoles (req, res, next) {
    applicationCTX.getApplicationRoles(req.application)
      .then((roles) => res.json(roles))
      .catch(next)
  }
)

router.get(
  `/:application(${generalMW.dbId})/roles/:role(${generalMW.dbId})`,
  function __getApplicationRole (req, res, next) {
    res.json(req.role)
  }
)

router.post(
  `/:application(${generalMW.dbId})/roles`,
  function __createApplicationRole (req, res, next) {
    applicationCTX.createApplicationRole(req.application, req.body)
      .then((role) => res.json(role))
      .catch(next)
  }
)

router.put(
  `/:application(${generalMW.dbId})/roles/:role(${generalMW.dbId})`,
  function __updateApplicationRole (req, res, next) {
    applicationCTX.updateApplicationRole(req.application, req.role, req.body)
      .then((role) => res.json(role))
      .catch(next)
  }
)

router.delete(
  `/:application(${generalMW.dbId})/roles/:role(${generalMW.dbId})`,
  function __deleteApplicationRole (req, res, next) {
    applicationCTX.deleteApplicationRole(req.role)
      .then((role) => res.json(role))
      .catch(next)
  }
)

module.exports = router
