'use strict'
/* global appDeployConfig */

module.exports = (function () {
  const bcrypt = require('bcrypt')
  const jwt = require('jsonwebtoken')
  const sql = require('../sql/sql-service')
  const winston = require('winston')

  const _verifyLogin = (user, password) => {
    return new Promise((resolve, reject) => {
      // Now see if the password matches
      bcrypt.compare(password, user.password, (err, valid) => {
        if (err) reject(err)
        if (!valid) {
          winston.log('error', 'Password does not match')
          return resolve(null)
        }
        // Build the JWT token and return it...
        let payload = {
          user_id: user.id,
          email: user.email,
          role: user.user_role,
          name: user.name
        }
        let token = jwt.sign(payload, appDeployConfig.environment.jwtSecret, { expiresIn: appDeployConfig.environment.jwtTimeout })
        resolve(token)
      })
    })
  }

  const login = (email, password) => {
    return sql.selectUserByEmail(email)
      .then((user) => {
        if (!user) {
          winston.log('error', `Unable to find user: ${email}`)
          return
        }
        return _verifyLogin(user, password)
      })
  }

  var mod = {
    login: login
  }

  return mod
}())
