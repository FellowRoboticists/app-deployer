'use strict'

var express = require('express')
var router = express.Router()
const multer = require('multer')

const upload = multer({ dest: '/tmp' })

const applicationCTX = require('./application-context')
const applicationMW = require('./application-middleware')
const sessionMW = require('../session/session-middleware')
const generalMW = require('../utility/general-middleware')

router.param('application', applicationMW.applicationIdParam)
router.param('role', applicationMW.roleIdParam)
router.param('release', applicationMW.releaseIdParam)

router.get(
  '/',
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer', 'reporter']),
  function __getApplications (req, res, next) {
    applicationCTX.getApplications()
      .then((applications) => res.json(applications))
      .catch(next)
  }
)

router.get(
  `/:application(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer', 'reporter']),
  function __getApplication (req, res, next) {
    res.json(req.application)
  }
)

router.post(
  '/',
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin']),
  function __createApplication (req, res, next) {
    applicationCTX.createApplication(req.body)
      .then((application) => res.json(application))
      .catch(next)
  }
)

router.put(
  `/:application(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin']),
  function __updateApplication (req, res, next) {
    applicationCTX.updateApplication(req.application, req.body)
      .then((application) => res.json(application))
      .catch(next)
  }
)

router.delete(
  `/:application(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin']),
  function __deleteApplication (req, res, next) {
    applicationCTX.deleteApplication(req.application)
      .then((application) => res.json(application))
      .catch(next)
  }
)

router.get(
  `/:application(${generalMW.dbId})/roles`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer', 'reporter']),
  function __getApplicationRoles (req, res, next) {
    applicationCTX.getApplicationRoles(req.application)
      .then((roles) => res.json(roles))
      .catch(next)
  }
)

router.get(
  `/:application(${generalMW.dbId})/roles/:role(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer', 'reporter']),
  function __getApplicationRole (req, res, next) {
    res.json(req.role)
  }
)

router.post(
  `/:application(${generalMW.dbId})/roles`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin']),
  function __createApplicationRole (req, res, next) {
    applicationCTX.createApplicationRole(req.application, req.body)
      .then((role) => res.json(role))
      .catch(next)
  }
)

router.put(
  `/:application(${generalMW.dbId})/roles/:role(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin']),
  function __updateApplicationRole (req, res, next) {
    applicationCTX.updateApplicationRole(req.application, req.role, req.body)
      .then((role) => res.json(role))
      .catch(next)
  }
)

router.delete(
  `/:application(${generalMW.dbId})/roles/:role(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin']),
  function __deleteApplicationRole (req, res, next) {
    applicationCTX.deleteApplicationRole(req.role)
      .then((role) => res.json(role))
      .catch(next)
  }
)

router.get(
  `/:application(${generalMW.dbId})/releases`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer', 'reporter']),
  function __getApplicationReleases (req, res, next) {
    applicationCTX.getApplicationReleases(req.application)
      .then((roles) => res.json(roles))
      .catch(next)
  }
)

router.get(
  `/:application(${generalMW.dbId})/releases/:release(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer', 'reporter']),
  function __getApplicationRelease (req, res, next) {
    res.json(req.release)
  }
)

router.post(
  `/:application(${generalMW.dbId})/releases`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin']),
  upload.fields([{
    name: 'tarball', maxCount: 1
  }, {
    name: 'seedfile', maxCount: 1
  }]),
  function __createApplicationRelease (req, res, next) {
    if (req.files['tarball'].length !== 1) {
      return res.status(400).json('No tarball was uploaded')
    }
    let tarball = req.files['tarball'][0]
    let seedfile = req.files['seedfile'] ? req.files['seedfile'][0] : null
    applicationCTX.createApplicationRelease(req.application, tarball, seedfile, req.body)
      .then((release) => res.json(release))
      .catch(next)
  }
)

router.put(
  `/:application(${generalMW.dbId})/releases/:release(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer']),
  function __updateApplicationRelease (req, res, next) {
    applicationCTX.updateApplicationRelease(req.application, req.release, req.body)
      .then((release) => res.json(release))
      .catch(next)
  }
)

router.delete(
  `/:application(${generalMW.dbId})/releases/:release(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer']),
  function __deleteApplicationRelease (req, res, next) {
    applicationCTX.deleteApplicationRelease(req.release)
      .then((release) => res.json(release))
      .catch(next)
  }
)

module.exports = router
