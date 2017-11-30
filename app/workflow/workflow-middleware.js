'use strict'

module.exports = (function () {
  const sqlSVC = require('../sql/sql-service')

  const workflowIdParam = function __workflowIdParam (req, res, next, id) {
    sqlSVC.selectWorkflowById(id)
      .then((workflow) => {
        req.workflow = workflow
        next()
      })
      .catch(next)
  }

  var mod = {
    workflowIdParam: workflowIdParam
  }

  return mod
}())
