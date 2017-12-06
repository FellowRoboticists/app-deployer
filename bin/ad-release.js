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
  .description('Manage application releases.')
  .option('-H, --host <host>', 'The host for the API calls (default: localhost)', 'localhost')
  .option('-p, --port <port>', 'The port number for the API calls (default: 3000)', 3000)
  .option('-P, --protocol <protocol>', 'The protocol for the API calls (default: http)', 'http')
  .option('-c, --create', 'Create a new release')
  .option('-a, --app-id <appid>', 'The id of the application of the role: required')
  .option('-q, --app-version <app-version>', 'Specify the version of the new release. Use with --create or --update')
  .option('-t, --tarball <tarball>', 'Specify the path of the tarball. Use with --create')
  .option('-s, --seedfile <seedfile>', 'Specify the path of the seedfile. Use with --create')
  .option('-l, --list', 'List the releases')
  .option('-u, --update', 'Update the release')
  .option('-d, --delete', 'Delete a release')
  .option('-i, --id <id>', 'Id of the release. Use with --delete and --update')
  .parse(process.argv)

const baseUri = (appId) => {
  return `${program.protocol}://${program.host}:${program.port}/applications/${appId}/releases`
}

const releaseUri = (appId, releaseId) => {
  return `${baseUri(appId)}/${releaseId}`
}

const createRelease = (appId, version, tarball, seedfile, token) => {
  if (!version || !tarball) {
    console.error('Must specify the version and tarball of the release to create!')
    process.exit(1)
  }
  let options = {
    method: 'POST',
    url: baseUri(appId),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    formData: {
      application_id: appId,
      version: version,
      tarball: {
        value: fs.createReadStream(tarball),
        options: {
          filename: path.basename(tarball),
          contentType: 'application/octet-stream'
        }
      }
    }
  }
  if (seedfile) {
    options.formData.seedfile = {
      value: fs.createReadStream(seedfile),
      options: {
        filename: path.basename(seedfile),
        contentType: 'application/octet-stream'
      }
    }
  }
  request(options)
    .then((release) => {
      console.log(`New release: ${release.id} - ${release.application_id}, ${release.version}, ${release.tarball}, ${release.created_at}`)
    })
    .catch(errorSVC.consoleError)
}

const updateRelease = (appId, id, version, token) => {
  if (!version || !id) {
    console.error('Must specify the information of the release to update!')
    process.exit(1)
  }
  let options = {
    method: 'PUT',
    url: releaseUri(appId, id),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: { application_id: appId, version: version }
  }
  request(options)
    .then((release) => {
      console.log(`Updated release: ${release.id} - ${release.application_id}, ${release.version}, ${release.tarball}, ${release.created_at}`)
    })
    .catch(errorSVC.consoleErr)
}

const listReleases = (appId, token) => {
  let options = {
    url: baseUri(appId),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }

  request.get(options)
    .then((releases) => {
      console.log('Releases')
      let table = new Table({
        head: ['rowid', 'application_id', 'version', 'tarball', 'seedfile', 'user_id', 'timestamp', 'created_at']
      })
      releases.forEach((release) => {
        table.push([release.id, release.application_id, release.version, release.tarball, release.seedfile ? release.seedfile : '', release.user_id, release.timestamp, release.created_at])
      })
      console.log(table.toString())
      console.log(`${releases.length} Releases`)
    })
    .catch(errorSVC.consoleError)
}

const deleteRelease = (appId, id, token) => {
  if (!id) {
    console.error('Must specify the id of the release to delete!')
    process.exit(1)
  }
  let options = {
    method: 'DELETE',
    url: releaseUri(appId, id),
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
  request(options)
    .then((release) => {
      console.log(`Delete release: ${release.id} - ${release.application_id}, ${release.version}, ${release.tarball}, ${release.created_at}`)
    })
    .catch(errorSVC.consoleError)
}

if (!program.appId) {
  console.error('Must specify the application ID!')
  process.exit(1)
}

const readToken = () => {
  let tokenPath = path.join(process.env.HOME, '.app-deployer/token')
  return fs.readFile(tokenPath, 'utf8')
}

readToken()
  .then((token) => {
    if (program.create) {
      createRelease(program.appId, program.appVersion, program.tarball, program.seedfile, token)
    } else if (program.update) {
      updateRelease(program.appId, program.id, program.appVersion, token)
    } else if (program.list) {
      listReleases(program.appId, token)
    } else if (program.delete) {
      deleteRelease(program.appId, program.id, token)
    }
  })
  .catch((err) => console.error('Not logged in: ' + err.stack || err))
