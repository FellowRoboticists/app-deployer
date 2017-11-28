'use strict'

module.exports = (function () {
  const sqlSVC = require('../sql/sql-service')

  const applicationIdParam = function __applicationIdParam (req, res, next, id) {
    sqlSVC.selectApplicationById(id)
      .then((application) => {
        req.application = application
        next()
      })
      .catch(next)
  }

  const roleIdParam = function __roleIdParam (req, res, next, id) {
    sqlSVC.selectApplicationRoleById(id)
      .then((role) => {
        if (req.application) {
          if (role.application_id === req.application.id) {
            req.role = role
            return next()
          } else {
            return next(new Error("Role's application id doesn't match specified application"))
          }
        } else {
          req.role = role
          next()
        }
      })
  }

  const releaseIdParam = function __releaseIdParam (req, res, next, id) {
    sqlSVC.selectApplicationReleaseById(id)
      .then((release) => {
        if (req.application) {
          if (release.application_id === req.application.id) {
            req.release = release
            return next()
          } else {
            return next(new Error("Release's application id doesn't match specified application"))
          }
        } else {
          req.release = release
          next()
        }
      })
  }

  var mod = {
    applicationIdParam: applicationIdParam,
    releaseIdParam: releaseIdParam,
    roleIdParam: roleIdParam
  }

  return mod
}())
