#!/usr/bin/env node
'use strict'

const read = require('read')
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
  .option('-c, --create', 'Create a new user')
  .option('-e, --email <email>', 'Email address. Use with --create')
  .option('-n, --name <name>', 'Specify the name of the new name. Use with --create or --update')
  .option('-I, --disabled', 'Specify that the user be disabled; default is enabled')
  .option('-l, --list', 'List the users')
  .option('-u, --update', 'Update the user')
  .option('-d, --delete', 'Delete an user')
  .option('-i, --id <id>', 'Id of the user. Use with --delete and --update')
  .option('-A, --admin', 'The user is an administrator')
  .option('-D, --deployer', 'The user is a deployer')
  .option('-R, --reporter', 'The user is a reporter')
  .parse(process.argv)

const baseUri = () => {
  return `${program.protocol}://${program.host}:${program.port}/users`
}

const userUri = (userId) => {
  return `${baseUri()}/${userId}`
}

const createUser = (email, name, role, enabled, password) => {
  if (!(email && name && role && password)) {
    console.error('Must specify the data for the user to create!')
    process.exit(1)
  }
  let options = {
    method: 'POST',
    url: baseUri(),
    json: true,
    body: {
      email: email,
      name: name,
      user_role: role,
      password: password,
      enabled: enabled
    }
  }
  request(options)
    .then((user) => {
      console.log(`New user: ${user.id} - ${user.email}, ${user.name}, ${user.user_role}`)
    })
    .catch(errorSVC.consoleError)
}

const updateUser = (id, name, role, enabled, token) => {
  if (!(name && role)) {
    console.error('Must specify the name and role of the user to update!')
    process.exit(1)
  }
  if (!id) {
    console.error('Must specify the id of the user to update!')
    process.exit(1)
  }
  let options = {
    method: 'PUT',
    url: userUri(id),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: { name: name, user_role: role, enabled: enabled }
  }
  request(options)
    .then((user) => {
      console.log(`Updated user: ${user.id} - ${user.email}, ${user.name}, ${user.user_role}`)
    })
    .catch(errorSVC.consoleErr)
}

const listUsers = (token) => {
  let options = {
    url: baseUri(),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
  request.get(options)
    .then((users) => {
      if (users.length) {
        console.log('Users')
        let table = new Table({
          head: ['rowid', 'email', 'name', 'user_role', 'enabled']
        })
        users.forEach((user) => {
          table.push([user.id, user.email, user.name, user.user_role, user.enabled])
        })
        console.log(table.toString())
        console.log(`${users.length} Users`)
      } else {
        console.log('No users registered.')
      }
    })
    .catch(errorSVC.consoleError)
}

const deleteUser = (id, token) => {
  if (!id) {
    console.error('Must specify the id of the user to delete!')
    process.exit(1)
  }
  let options = {
    method: 'DELETE',
    url: userUri(id),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
  request(options)
    .then((user) => {
      console.log(`Delete user: ${user.id} - ${user.id} - ${user.email}, ${user.name}, ${user.user_role}`)
    })
    .catch(errorSVC.consoleError)
}

const getPassword = (prompt) => {
  return new Promise((resolve, reject) => {
    read({ prompt: `${prompt} :`, silent: true }, (err, password) => {
      if (err) return reject(err)
      resolve(password)
    })
  })
}

const readToken = () => {
  let tokenPath = path.join(process.env.HOME, '.app-deployer/token')
  return fs.readFile(tokenPath, 'utf8')
}

if (program.create) {
  getPassword('Password')
    .then((password) => {
      return getPassword('Password (confirmation)')
        .then((passwordConfirmation) => {
          if (password === passwordConfirmation) {
            return createUser(program.email, program.name, 'reporter', !program.enabled, password)
          }
        })
    })
} else {
  readToken()
    .then((token) => {
      if (program.update) {
        let role = program.admin ? 'admin' : program.deployer ? 'deployer' : 'reporter'
        console.log(`Program.disabled: ${program.disabled}`)
        console.log(`Program.enabled: ${program.enabled}`)
        console.log(`!Program.enabled: ${!program.enabled}`)
        let enabled = (typeof program.disabled === 'undefined' || !program.disabled)
        updateUser(program.id, program.name, role, enabled, token)
      } else if (program.list) {
        listUsers(token)
      } else if (program.delete) {
        deleteUser(program.id, token)
      }
    })
    .catch(() => console.error('Not logged in.'))
}
