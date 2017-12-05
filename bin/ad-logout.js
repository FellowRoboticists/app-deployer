#!/usr/bin/env node
'use strict'

const fs = require('fs-extra')
const path = require('path')

const program = require('commander')
const errorSVC = require('../app/utility/error-service')

program
  .version('0.0.1')
  .description('Remove the login token')
  .parse(process.argv)

// Now just remove the token file
let tokenFile = path.join(process.env.HOME, '.app-deployer/token')

fs.remove(tokenFile)
  .then(() => console.log('Logged out.'))
  .catch(errorSVC.consoleError)
