#!/usr/bin/env node

const fs = require('fs')
const program = require('commander')

const configPath = 'deploy-config.json'

program
  .version('0.0.1')
  .option('-r --role <role>', 'Specify the role to invoke')
  .parse(process.argv)

if (!program.role) {
  console.error('Must specify the role to invoke')
  process.exit(1)
}

const readConfig = (configPath, role) => {
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, (err, data) => {
      if (err) return reject(err)
      resolve(JSON.parse(data)[role])
    })
  })
}

const dealWithRPM = (which, config) => {
  let field = `rpm${which}name`
  console.log(`# yum update ${config[field]}`)
  return Promise.resolve(config)
}

const doSeedData = (config) => {
  console.log(`Doing the seed data: ${config.seedDataLoad}`)
  return Promise.resolve(config)
}

const doMigration = (config) => {
  console.log(`Doing the migration: ${config.schemaMigration}`)
  return Promise.resolve(config)
}

const doScript = (prePost, which, config) => {
  let field = `${prePost}MigrationScript${which}`
  console.log(`# ${config[field]}`)
  return Promise.resolve(config)
}

readConfig(configPath, program.role)
  .then((config) => dealWithRPM(1, config))
  .then((config) => dealWithRPM(2, config))
  .then((config) => doScript('pre', 1, config))
  .then((config) => doScript('pre', 2, config))
  .then((config) => doScript('pre', 3, config))
  .then((config) => doScript('pre', 4, config))
  .then((config) => doScript('pre', 5, config))
  .then((config) => doSeedData(config))
  .then((config) => doMigration(config))
  .then((config) => doScript('post', 1, config))
  .then((config) => doScript('post', 2, config))
  .then((config) => doScript('post', 3, config))
  .then((config) => doScript('post', 4, config))
  .then((config) => doScript('post', 5, config))

  .catch((err) => {
    console.error(err.stack || err)
    process.exit(1)
  })
