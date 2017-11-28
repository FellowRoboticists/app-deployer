'use strict'
/* global appDeployConfig */

module.exports = (function () {
  const bcrypt = require('bcrypt')
  const jwt = require('jsonwebtoken')
  const sql = require('../sql/sql-service')

  const _verifyLogin = (user, password) => {
    return new Promise((resolve, reject) => {
      // Now see if the password matches
      bcrypt.compare(password, user.password, (err, valid) => {
        if (err) reject(err)
        if (!valid) reject(new Error('Failed authentication'))
        // Build the JWT token and return it...
        let payload = {
          email: user.email,
          role: user.user_role,
          name: user.name
        }
        let token = jwt.sign(payload, appDeployConfig.environment.jwtSecret, { expiresIn: 60 * 60 })
        resolve(token)
      })
    })
  }

  const login = (email, password) => {
    return sql.selectUserByEmail(email)
      .then((user) => {
        if (!user) throw new Error(`Unable to find user: ${email}`)
        return _verifyLogin(user, password)
      })
  }

  var mod = {
    login: login
  }

  return mod
}())
