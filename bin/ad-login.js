#!/usr/bin/env node
'use strict'

const read = require('read')
const fs = require('fs-extra')
const path = require('path')

const request = require('request-promise-native')
const program = require('commander')
const errorSVC = require('../app/utility/error-service')

program
  .version('0.0.1')
  .option('-H, --host <host>', 'The host for the API calls (default: localhost)', 'localhost')
  .option('-p, --port <port>', 'The port number for the API calls (default: 3000)', 3000)
  .option('-P, --protocol <protocol>', 'The protocol for the API calls (default: http)', 'http')
  .parse(process.argv)

const user = process.argv[2]

if (!user) {
  console.error('First argument must be your email address!')
  process.exit(1)
}

const baseUri = () => {
  return `${program.protocol}://${program.host}:${program.port}/sessions`
}

const getPassword = () => {
  return new Promise((resolve, reject) => {
    read({ prompt: 'Password: ', silent: true }, (err, password) => {
      if (err) return reject(err)
      resolve(password)
    })
  })
}

getPassword()
  .then((password) => {
    let options = {
      url: baseUri(),
      method: 'POST',
      json: true,
      body: {
        email: user,
        password: password
      }
    }

    return request(options)
      .then((token) => {
        let tokenFile = path.join(process.env.HOME, '.app-deployer/token')
        fs.outputFile(tokenFile, token.token)
          .then(() => console.log('Login successful.'))
      })
  })
  .catch(errorSVC.consoleError)
