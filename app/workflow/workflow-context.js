'use strict'

module.exports = (function () {
  const sqlSVC = require('../sql/sql-service')

  const createWorkflow = (workflowParams) => {
    console.log(`### ${JSON.stringify(workflowParams)}`)
    return sqlSVC.insertWorkflow(workflowParams.role_id, workflowParams.playbook, workflowParams.sequence, workflowParams.enforce_tw, workflowParams.pause_after, workflowParams.final)
      .then(() => sqlSVC.selectLatestWorkflow())
  }

  const deleteWorkflow = (workflow) => {
    return sqlSVC.deleteWorkflow(workflow.id)
      .then(() => workflow)
  }

  const getWorkflows = (queryParams) => {
    if (queryParams.roleId) {
      return sqlSVC.selectRoleWorkflows(queryParams.roleId)
    } else {
      return sqlSVC.selectWorkflows()
    }
  }

  const updateWorkflow = (workflow, workflowParams) => {
    console.log(`### ${JSON.stringify(workflowParams)}`)
    return sqlSVC.updateWorkflow(workflow.id, workflowParams.role_id, workflowParams.playbook, workflowParams.sequence, workflowParams.enforce_tw, workflowParams.pause_after, workflowParams.final)
      .then(() => sqlSVC.selectWorkflowById(workflow.id))
  }

  var mod = {
    createWorkflow: createWorkflow,
    deleteWorkflow: deleteWorkflow,
    getWorkflows: getWorkflows,
    updateWorkflow: updateWorkflow
  }

  return mod
}())
