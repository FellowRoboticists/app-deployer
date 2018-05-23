'use strict'
/* global appDeployConfig */

module.exports = (function () {
  const bcrypt = require('bcrypt')
  const jwt = require('jsonwebtoken')
  const sql = require('../sql/sql-service')
  const winston = require('winston')
  const {promisify} = require('util')

  const bcryptCompare = promisify(bcrypt.compare)

  const _verifyLogin = async (user, password) => {
    // Now see if the password matches
    let valid = await bcryptCompare(password, user.password)
    if (!valid) {
      winston.log('error', 'Password does not match')
      return null
    }

    // Build the JWT token and return it...
    let payload = {
      user_id: user.id,
      email: user.email,
      role: user.user_role,
      name: user.name
    }

    return jwt.sign(payload, appDeployConfig.environment.jwtSecret, { expiresIn: appDeployConfig.environment.jwtTimeout })
  }

  const login = async (email, password) => {
    let user = await sql.selectUserByEmail(email)

    if (!user) {
      winston.log('error', `Unable to find user: ${email}`)
      return
    }
    return _verifyLogin(user, password)
  }

  var mod = {
    login: login
  }

  return mod
}())
