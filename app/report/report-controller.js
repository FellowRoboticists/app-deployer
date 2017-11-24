'use strict'

var express = require('express')
var router = express.Router()

const reportCTX = require('./report-context')
const applicationMW = require('../application/application-middleware')
const generalMW = require('../utility/general-middleware')

router.param('application', applicationMW.applicationIdParam)
router.param('role', applicationMW.roleIdParam)

router.get(
  `/applications/:application(${generalMW.dbId})`,
  function __getApplicationReport (req, res, next) {
    reportCTX.getApplicationReport(req.application)
      .then((report) => res.json(report))
      .catch(next)
  }
)

router.get(
  `/roles/:role(${generalMW.dbId})`,
  function __getRoleReport (req, res, next) {
    reportCTX.getRoleReport(req.role)
      .then((report) => res.json(report))
      .catch(next)
  }
)

module.exports = router
