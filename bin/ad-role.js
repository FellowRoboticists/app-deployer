#!/usr/bin/env node
'use strict'

const request = require('request-promise-native')
const program = require('commander')

program
  .version('0.0.1')
  .option('-H, --host <host>', 'The host for the API calls (default: localhost)', 'localhost')
  .option('-p, --port <port>', 'The port number for the API calls (default: 3000)', 3000)
  .option('-P, --protocol <protocol>', 'The protocol for the API calls (default: http)', 'http')
  .option('-c, --create', 'Create a new role')
  .option('-a, --app-id <appid>', 'The id of the application of the role: required')
  .option('-n, --name <name>', 'Specify the name of the new role. Use with --create or --update')
  .option('-s, --server <server>', 'Specify the name of the server for the role. Use with --create or --update')
  .option('-t, --time-window <window>', 'Specify the time window for the role (if needed)')
  .option('-l, --list', 'List the roles')
  .option('-u, --update', 'Update the role')
  .option('-d, --delete', 'Delete an role')
  .option('-i, --id <id>', 'Id of the role. Use with --delete and --update')
  .parse(process.argv)

const baseUri = (appId) => {
  return `${program.protocol}://${program.host}:${program.port}/applications/${appId}/roles`
}

const roleUri = (appId, roleId) => {
  return `${baseUri(appId)}/${roleId}`
}

const createRole = (appId, name, server, timeWindow) => {
  if (!name || !server) {
    console.error('Must specify the name and server of the role to create!')
    process.exit(1)
  }
  let options = {
    method: 'POST',
    url: baseUri(appId),
    json: true,
    body: { role: name, active_server: server, time_window: timeWindow }
  }
  request(options)
    .then((role) => {
      console.log(`New role: ${role.id} - ${role.application_id}, ${role.role}, ${role.active_server}, ${role.time_window}`)
    })
    .catch(console.error)
}

const updateRole = (appId, id, name, server, timeWindow) => {
  if (!name || !id || !server) {
    console.error('Must specify the information of the role to update!')
    process.exit(1)
  }
  let options = {
    method: 'PUT',
    url: roleUri(appId, id),
    json: true,
    body: { application_id: appId, role: name, active_server: server, time_window: timeWindow }
  }
  request(options)
    .then((role) => {
      console.log(`Updated role: ${role.id} - ${role.application_id}, ${role.role}, ${role.active_server}, ${role.time_window}`)
    })
    .catch(console.err)
}

const listRoles = (appId) => {
  let options = {
    url: baseUri(appId),
    json: true
  }

  request.get(options)
    .then((roles) => {
      console.log('Roles')
      console.log('============')
      roles.forEach((role) => {
        console.log(`${role.id} - ${role.application_id}, ${role.role}, ${role.active_server}, ${role.time_window}`)
      })
      console.log('------------')
      console.log(`${roles.length} Roles`)
    })
    .catch(console.error)
}

const deleteRole = (appId, id) => {
  if (!id) {
    console.error('Must specify the id of the role to delete!')
    process.exit(1)
  }
  let options = {
    method: 'DELETE',
    url: roleUri(appId, id),
    json: true
  }
  request(options)
    .then((role) => {
      console.log(`Delete role: ${role.id} - ${role.application_id}, ${role.role}, ${role.active_server}, ${role.time_window}`)
    })
    .catch(console.error)
}

if (!program.appId) {
  console.error('Must specify the application ID!')
  process.exit(1)
}

if (program.create) {
  createRole(program.appId, program.name, program.server, program.timeWindow)
} else if (program.update) {
  updateRole(program.appId, program.id, program.name, program.server, program.timeWindow)
} else if (program.list) {
  listRoles(program.appId)
} else if (program.delete) {
  deleteRole(program.appId, program.id)
}
