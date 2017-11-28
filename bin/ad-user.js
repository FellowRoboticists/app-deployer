#!/usr/bin/env node
'use strict'

const read = require('read')
const fs = require('fs-extra')
const path = require('path')
const request = require('request-promise-native')
const program = require('commander')

program
  .version('0.0.1')
  .option('-H, --host <host>', 'The host for the API calls (default: localhost)', 'localhost')
  .option('-p, --port <port>', 'The port number for the API calls (default: 3000)', 3000)
  .option('-P, --protocol <protocol>', 'The protocol for the API calls (default: http)', 'http')
  .option('-c, --create', 'Create a new user')
  .option('-e, --email <email>', 'Email address. Use with --create')
  .option('-n, --name <name>', 'Specify the name of the new name. Use with --create or --update')
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

const createUser = (email, name, role, password) => {
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
      password: password
    }
  }
  request(options)
    .then((user) => {
      console.log(`New user: ${user.id} - ${user.email}, ${user.name}, ${user.user_role}`)
    })
    .catch(console.error)
}

const updateUser = (id, name, role, token) => {
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
    body: { name: name, user_role: role }
  }
  request(options)
    .then((user) => {
      console.log(`Updated user: ${user.id} - ${user.email}, ${user.name}, ${user.user_role}`)
    })
    .catch(console.err)
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
      console.log('Users')
      console.log('============')
      users.forEach((user) => {
        console.log(`${user.id} - ${user.email}, ${user.name}, ${user.user_role}`)
      })
      console.log('------------')
      console.log(`${users.length} Users`)
    })
    .catch(console.error)
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
    .catch(console.error)
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
            return createUser(program.email, program.name, 'reporter', password)
          }
        })
    })
} else {
  readToken()
    .then((token) => {
      if (program.update) {
        let role = program.admin ? 'admin' : program.deployer ? 'deployer' : 'reporter'
        updateUser(program.id, program.name, role, token)
      } else if (program.list) {
        listUsers(token)
      } else if (program.delete) {
        deleteUser(program.id, token)
      }
    })
    .catch(() => console.error('Not logged in.'))
}
