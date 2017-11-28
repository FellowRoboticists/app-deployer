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
  .option('-c, --create', 'Create a new application')
  .option('-n, --name <name>', 'Specify the name of the new application. Use with --create or --update')
  .option('-l, --list', 'List the applications')
  .option('-u, --update', 'Update the application')
  .option('-d, --delete', 'Delete an application')
  .option('-i, --id <id>', 'Id of the application. Use with --delete and --update')
  .parse(process.argv)

const baseUri = () => {
  return `${program.protocol}://${program.host}:${program.port}/applications`
}

const applicationUri = (appId) => {
  return `${baseUri()}/${appId}`
}

const createApplication = (name, token) => {
  if (!name) {
    console.error('Must specify the name of the application to create!')
    process.exit(1)
  }
  let options = {
    method: 'POST',
    url: baseUri(),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: { name: name }
  }
  request(options)
    .then((application) => {
      console.log(`New application: ${application.id} - ${application.name}`)
    })
    .catch(console.error)
}

const updateApplication = (id, name, token) => {
  if (!name) {
    console.error('Must specify the name of the application to update!')
    process.exit(1)
  }
  if (!id) {
    console.error('Must specify the id of the application to update!')
    process.exit(1)
  }
  let options = {
    method: 'PUT',
    url: applicationUri(id),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: { name: name }
  }
  request(options)
    .then((application) => {
      console.log(`Updated application: ${application.id} - ${application.name}`)
    })
    .catch(console.err)
}

const listApplications = (token) => {
  let options = {
    url: baseUri(),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
  request.get(options)
    .then((applications) => {
      console.log('Applications')
      console.log('============')
      applications.forEach((app) => {
        console.log(`${app.id} - ${app.name}`)
      })
      console.log('------------')
      console.log(`${applications.length} Applications`)
    })
    .catch(console.error)
}

const deleteApplication = (id, token) => {
  if (!id) {
    console.error('Must specify the id of the application to delete!')
    process.exit(1)
  }
  let options = {
    method: 'DELETE',
    url: applicationUri(id),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
  request(options)
    .then((application) => {
      console.log(`Delete application: ${application.id} - ${application.name}`)
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
      createApplication(program.name, token)
    } else if (program.update) {
      updateApplication(program.id, program.name, token)
    } else if (program.list) {
      listApplications(token)
    } else if (program.delete) {
      deleteApplication(program.id, token)
    }
  })
  .catch(() => console.error('Not logged in.'))
