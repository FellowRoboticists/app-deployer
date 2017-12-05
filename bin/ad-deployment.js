#!/usr/bin/env node
'use strict'

const fs = require('fs-extra')
const path = require('path')
const request = require('request-promise-native')
const program = require('commander')
const Table = require('cli-table')
const errorSVC = require('../app/utility/error-service')

program
  .version('0.0.1')
  .option('-H, --host <host>', 'The host for the API calls (default: localhost)', 'localhost')
  .option('-p, --port <port>', 'The port number for the API calls (default: 3000)', 3000)
  .option('-P, --protocol <protocol>', 'The protocol for the API calls (default: http)', 'http')
  .option('-c, --create', 'Create a new role')
  .option('-r, --role-id <roleId>', 'The id of the role of the deployment: required')
  .option('-e, --release-id <releaseId>', 'The id of the release of the deployment: required')
  .option('-l, --list', 'List the deployments. Specify --role-id or --release-id')
  .option('-u, --update', 'Update the deployment')
  .option('-g, --do-deploy', 'Deploy the specified application/version')
  .option('-a, --application <application>', 'The application to deploy')
  .option('-q, --app-version <appVersion>', 'The version of the application to deploy')
  .option('-n, --role <role>', 'The role of the application to which to deploy')
  .option('-s, --status <status>', 'Status for the deployment. Use with --update')
  .option('-d, --delete', 'Delete a deployment')
  .option('-i, --id <id>', 'Id of the role. Use with --delete and --update')
  .parse(process.argv)

const baseUri = () => {
  return `${program.protocol}://${program.host}:${program.port}/deployments`
}

const deploymentUri = (deploymentId) => {
  return `${baseUri()}/${deploymentId}`
}

const doDeployment = (application, appVersion, role, token) => {
  if (!(application && appVersion)) {
    console.error('Must specify the application and version to deploy')
    process.exit(1)
  }
  let options = {
    method: 'POST',
    url: baseUri() + '/deploy',
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: { application: application, appVersion: appVersion, role: role }
  }
  request(options)
    .then((deployment) => {
      console.log(`New deployment: ${deployment.id} - ${deployment.release_id}, ${deployment.role_id}, ${deployment.status}`)
    })
    .catch(errorSVC.consoleError)
}

const createDeployment = (releaseId, roleId, token) => {
  if (!releaseId || !roleId) {
    console.error('Must specify the role and release ids of the deployment to create!')
    process.exit(1)
  }
  let options = {
    method: 'POST',
    url: baseUri(),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: { role_id: roleId, release_id: releaseId }
  }
  request(options)
    .then((deployment) => {
      console.log(`New deployment: ${deployment.id} - ${deployment.release_id}, ${deployment.role_id}, ${deployment.status}`)
    })
    .catch(errorSVC.consoleError)
}

const updateDeployment = (id, status, token) => {
  if (!status) {
    console.error('Must specify the information of the deployment to update!')
    process.exit(1)
  }
  let options = {
    method: 'PUT',
    url: deploymentUri(id),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: { status: status }
  }
  request(options)
    .then((deployment) => {
      console.log(`Updated deployment: ${deployment.id} - ${deployment.release_id}, ${deployment.role_id}, ${deployment.status}`)
    })
    .catch(errorSVC.consoleErr)
}

const listDeployments = (releaseId, roleId, token) => {
  if (!(releaseId || roleId)) {
    console.error('Must specify either --release-id or --role-id')
    process.exit(1)
  }
  let qs = {
  }
  if (releaseId) qs.release_id = releaseId
  if (roleId) qs.role_id = roleId
  let options = {
    url: baseUri(),
    qs: qs,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    json: true
  }

  request.get(options)
    .then((deployments) => {
      console.log('Deployments')
      let table = new Table({
        head: ['rowid', 'name', 'version', 'role', 'status']
      })
      deployments.forEach((deployment) => {
        table.push([deployment.id, deployment.name, deployment.version, deployment.role, deployment.status])
      })
      console.log(table.toString())
      console.log(`${deployments.length} Deployments`)
    })
    .catch(errorSVC.consoleError)
}

const deleteDeployment = (id, token) => {
  if (!id) {
    console.error('Must specify the id of the deployment to delete!')
    process.exit(1)
  }
  let options = {
    method: 'DELETE',
    url: deploymentUri(id),
    headers: {
      'Authorization': `Bearer ${token}`
    },
    json: true
  }
  request(options)
    .then((deployment) => {
      console.log(`Deleted deployment: ${deployment.id} - ${deployment.release_id}, ${deployment.role_id}, ${deployment.status}`)
    })
    .catch(errorSVC.consoleError)
}

const readToken = () => {
  let tokenPath = path.join(process.env.HOME, '.app-deployer/token')
  return fs.readFile(tokenPath, 'utf8')
}

readToken()
  .then((token) => {
    if (program.create) {
      createDeployment(program.releaseId, program.roleId, token)
    } else if (program.update) {
      updateDeployment(program.id, program.status, token)
    } else if (program.list) {
      listDeployments(program.releaseId, program.roleId, token)
    } else if (program.delete) {
      deleteDeployment(program.id, token)
    } else if (program.doDeploy) {
      doDeployment(program.application, program.appVersion, program.role, token)
    }
  })
  .catch(() => console.error('Not logged in.'))
