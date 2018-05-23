#!/usr/bin/env node
'use script'

const program = require('commander')
const bcrypt = require('bcrypt')
const {promisify} = require('util')

const bcryptHash = promisify(bcrypt.hash)

require('../bootstrap')

const sqlSVC = require('../app/sql/sql-service')

sqlSVC.prepDB()

program
  .version('0.0.1')
  .option('-e, --email <email>', 'Specify the email address of the user')
  .option('-n, --name <name>', 'Specify the name of the user')
  .option('-p, --password <password>', 'Specify the password for the user')
  .option('-A, --admin', 'The user is an administrator')
  .option('-D, --deployer', 'The user is a deployer')
  .option('-R, --reporter', 'The user is a reporter')
  .option('-d, --disabled', 'Disable the user (default is enabled')
  .parse(process.argv)

if (!program.email) {
  console.error('Must specify an email address')
  process.exit(1)
}

if (!program.name) {
  console.error('Must specify a user name')
  process.exit(1)
}

if (!program.password) {
  console.error('Must specify a user password')
  process.exit(1)
}

if (!(program.admin || program.deployer || program.reporter)) {
  console.error('Must specify if user is admin, deployer or reporter')
  process.exit(1)
}

const cryptPassword = async (password) => {
  return bcryptHash(password, 10)
}

const userRole = () => program.admin ? 'admin' : program.deployer ? 'deployer' : 'reporter'

const enabled = !program.disabled

async function registerUser (program) {
  let user = await sqlSVC.selectUserByEmail(program.email)

  if (user) throw new Error(`User with email (${program.email}) already exists.`)
  let encryptedPassword = await cryptPassword(program.password)

  return sqlSVC.insertUser({ email: program.email, name: program.name, user_role: userRole(), enabled: enabled }, encryptedPassword)
}

registerUser(program)
  .then(() => {
    console.log(`Successfully added user ${program.email}`)
    process.exit(0)
  })
  .catch((err) => {
    console.error(err.stack || err)
    process.exit(1)
  })

//sqlSVC.selectUserByEmail(program.email)
  //.then((user) => {
    //if (user) throw new Error(`User with email (${program.email}) already exists.`)
    //return cryptPassword(program.password)
      //.then((encryptedPassword) => sqlSVC.insertUser({ email: program.email, name: program.name, user_role: userRole(), enabled: enabled }, encryptedPassword))
  //})
  //.then(() => {
    //console.log(`Successfully added user ${program.email}`)
    //process.exit(0)
  //})
  //.catch((err) => {
    //console.error(err.stack || err)
    //process.exit(1)
  //})
