#!/usr/bin/env node
'use script'

const program = require('commander')
const bcrypt = require('bcrypt')

require('../bootstrap')

const db = require('../app/utility/db')

db.prepDB()

const dbConn = db.conn()

program
  .version('0.0.1')
  .option('-e, --email <email>', 'Specify the email address of the user')
  .option('-n, --name <name>', 'Specify the name of the user')
  .option('-p, --password <password>', 'Specify the password for the user')
  .option('-A, --admin', 'The user is an administrator')
  .option('-D, --deployer', 'The user is a deployer')
  .option('-R, --reporter', 'The user is a reporter')
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

const selectUsersSQL = `
  SELECT
    email
  FROM
    users
  WHERE
    email = ?`

const insertUserSQL = `
  INSERT INTO users (
    email,
    password,
    user_role,
    name
  ) VALUES (
    ?, ?, ?, ?
  )`

dbConn.get(selectUsersSQL, program.email, (err, row) => {
  if (err) {
    console.error(err.stack || err)
    process.exit(1)
  }
  if (!row) {
    let userRole = program.admin ? 'admin' : program.deployer ? 'deployer' : 'reporter'
    // hash the password
    bcrypt.hash(program.password, 10, (err, encryptedPassword) => {
      if (err) {
        console.error(err.stack || err)
        return
      }
      dbConn.run(insertUserSQL, program.email, encryptedPassword, userRole, program.name, (err) => {
        if (err) {
          console.error(err.stack || err)
          process.exit(1)
        }
        console.log(`Successfully added user ${program.email}`)
        process.exit(0)
      })
    })
  } else {
    console.error(`User with email (${program.email}) already exists. Exiting.`)
    process.exit(1)
  }
})
