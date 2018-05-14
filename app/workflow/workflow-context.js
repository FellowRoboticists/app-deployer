'use strict'

module.exports = (function () {
  const sqlSVC = require('../sql/sql-service')

  const createWorkflow = async (workflowParams) => {
    await sqlSVC.insertWorkflow(workflowParams.role_id, workflowParams.playbook, workflowParams.sequence, workflowParams.enforce_tw, workflowParams.pause_after, workflowParams.final)

    return sqlSVC.selectLatestWorkflow()
  }

  const deleteWorkflow = async (workflow) => {
    await sqlSVC.deleteWorkflow(workflow.id)
    return workflow
  }

  const getWorkflows = async (queryParams) => {
    if (queryParams.roleId) {
      return sqlSVC.selectRoleWorkflows(queryParams.roleId)
    } else {
      return sqlSVC.selectWorkflows()
    }
  }

  const updateWorkflow = async (workflow, workflowParams) => {
    console.log(`### ${JSON.stringify(workflowParams)}`)
    await sqlSVC.updateWorkflow(workflow.id, workflowParams.role_id, workflowParams.playbook, workflowParams.sequence, workflowParams.enforce_tw, workflowParams.pause_after, workflowParams.final)

    return sqlSVC.selectWorkflowById(workflow.id)
  }

  var mod = {
    createWorkflow: createWorkflow,
    deleteWorkflow: deleteWorkflow,
    getWorkflows: getWorkflows,
    updateWorkflow: updateWorkflow
  }

  return mod
}())
