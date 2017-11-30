#!/usr/bin/env node
'use strict'

const fs = require('fs-extra')
const path = require('path')
const request = require('request-promise-native')
const program = require('commander')

program
  .version('0.0.1')
  .option('-H, --host <host>', 'The host for the API calls (default: localhost)', 'localhost')
  .option('-p, --port <port>', 'The port number for the API calls (default: 3000)', 3000)
  .option('-P, --protocol <protocol>', 'The protocol for the API calls (default: http)', 'http')
  .option('-c, --create', 'Create a new workflow step')
  .option('-r, --role-id <roleId>', 'The roleId for the workflow')
  .option('-b, --playbook <playbook>', 'The name of the playbook to invoke')
  .option('-s, --sequence <sequence>', 'The sequence of the step within the workflow')
  .option('-e, --enforce-tw <enforceTw>', '0 - not enforcing TW, 1 - enforcing TW')
  .option('-a, --pause-after <pauseAfter>', '0 - do not pause, 1 - pause')
  .option('-f, --final <final>', '0 - not final, 1 - final')
  .option('-l, --list', 'List the workflow steps')
  .option('-u, --update', 'Update the workflow step')
  .option('-d, --delete', 'Delete a workflow')
  .option('-i, --id <id>', 'Id of the workflow. Use with --delete and --update')
  .parse(process.argv)

const baseUri = () => {
  return `${program.protocol}://${program.host}:${program.port}/workflows`
}

const workflowUri = (workflowId) => {
  return `${baseUri()}/${workflowId}`
}

const createWorkflow = (roleId, playbook, sequence, enforceTw, pauseAfter, finalStep, token) => {
  if (!(roleId && playbook && sequence && enforceTw && pauseAfter && finalStep)) {
    console.error('Must specify the details of the workflow to create!')
    process.exit(1)
  }
  let options = {
    method: 'POST',
    url: baseUri(),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: {
      role_id: roleId,
      playbook: playbook,
      sequence: sequence,
      enforce_tw: enforceTw,
      pause_after: pauseAfter,
      final: finalStep
    }
  }
  request(options)
    .then((workflow) => {
      console.log(`New workflow: ${workflow.id} - ${workflow.role_id}, ${workflow.playbook}, ${workflow.sequence}, ${workflow.enforce_tw}, ${workflow.pause_after}, ${workflow.final}`)
    })
    .catch(console.error)
}

const updateWorkflow = (id, roleId, playbook, sequence, enforceTw, pauseAfter, finalStep, token) => {
  if (!(roleId && playbook && sequence && enforceTw && pauseAfter && finalStep)) {
    console.error('Must specify the information of the workflow to update!')
    process.exit(1)
  }
  if (!id) {
    console.error('Must specify the id of the workflow to update!')
    process.exit(1)
  }
  let options = {
    method: 'PUT',
    url: workflowUri(id),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: {
      role_id: roleId,
      playbook: playbook,
      sequence: sequence,
      enforce_tw: enforceTw,
      pause_after: pauseAfter,
      final: finalStep
    }
  }
  request(options)
    .then((workflow) => {
      console.log(`Updated workflow: ${workflow.id} - ${workflow.role_id}, ${workflow.playbook}, ${workflow.sequence}, ${workflow.enforce_tw}, ${workflow.pause_after}, ${workflow.final}`)
    })
    .catch(console.err)
}

const listWorkflows = (roleId, token) => {
  let qs = {
  }
  if (roleId) qs.roleId = roleId
  let options = {
    url: baseUri(),
    qs: qs,
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
  request.get(options)
    .then((workflows) => {
      console.log('Workflows')
      console.log('============')
      workflows.forEach((workflow) => {
        console.log(`${workflow.id} - ${workflow.role_id}, ${workflow.playbook}, ${workflow.sequence}, ${workflow.enforce_tw}, ${workflow.pause_after}, ${workflow.final}`)
      })
      console.log('------------')
      console.log(`${workflows.length} Workflows`)
    })
    .catch(console.error)
}

const deleteWorkflow = (id, token) => {
  if (!id) {
    console.error('Must specify the id of the workflow to delete!')
    process.exit(1)
  }
  let options = {
    method: 'DELETE',
    url: workflowUri(id),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
  request(options)
    .then((workflow) => {
      console.log(`Deleted workflow: ${workflow.id} - ${workflow.role_id}, ${workflow.playbook}, ${workflow.sequence}, ${workflow.enforce_tw}, ${workflow.pause_after}, ${workflow.final}`)
    })
    .catch(console.error)
}

const readToken = () => {
  let tokenPath = path.join(process.env.HOME, '.app-deployer/token')
  return fs.readFile(tokenPath, 'utf8')
}

readToken()
  .then((token) => {
    if (program.create) {
      createWorkflow(program.roleId, program.playbook, program.sequence, program.enforceTw, program.pauseAfter, program.final, token)
    } else if (program.update) {
      updateWorkflow(program.id, program.roleId, program.playbook, program.sequence, program.enforceTw, program.pauseAfter, program.final, token)
    } else if (program.list) {
      listWorkflows(program.roleId, token)
    } else if (program.delete) {
      deleteWorkflow(program.id, token)
    }
  })
  .catch(() => console.error('Not logged in.'))
