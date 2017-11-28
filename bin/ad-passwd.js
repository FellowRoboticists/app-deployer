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
  .option('-i, --id <id>', 'Id of the user. Use with --delete and --update')
  .parse(process.argv)

const baseUri = () => {
  return `${program.protocol}://${program.host}:${program.port}/users`
}

const userUri = (userId) => {
  return `${baseUri()}/${userId}/change_password`
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

const changePassword = (userId, password, newPassword, token) => {
  if (!(userId && password && newPassword)) {
    console.error('Must specify what we need to change password.')
    process.exit(1)
  }
  let options = {
    method: 'PUT',
    url: userUri(userId),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: {
      password: password,
      newPassword: newPassword
    }
  }
  request(options)
    .then((user) => {
      console.log(`Password changed for ${user.email}`)
    })
}

readToken()
  .then((token) => {
    let currentPassword = null
    let newPassword = null
    let newPasswordConfirmation
    return getPassword('Current Password')
      .then((password) => {
        currentPassword = password
        return getPassword('New Password')
      })
      .then((password) => {
        newPassword = password
        return getPassword('New Password (Confirmation)')
      })
      .then((password) => {
        newPasswordConfirmation = password
        if (newPassword !== newPasswordConfirmation) {
          throw new Error("New passwords don't match")
        }
        changePassword(program.id, currentPassword, newPassword, token)
      })
  })
  .catch(console.error)
