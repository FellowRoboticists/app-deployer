'use strict'

module.exports = (function () {
  const sqlSVC = require('../sql/sql-service')
  // const deploySVC = require('./deploy-service')

  const getDeployments = (queryParameters) => {
    return sqlSVC.selectDeployments(queryParameters.release_id, queryParameters.role_id)
  }

  const createDeployment = (deployParams) => {
    return sqlSVC.insertDeployment(deployParams.release_id, deployParams.role_id)
      .then(() => sqlSVC.selectLatestDeployment())
  }

  var mod = {
    createDeployment: createDeployment,
    getDeployments: getDeployments
  }

  return mod
}())
