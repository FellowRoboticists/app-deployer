'use strict'
/* global appDeployConfig */

module.exports = (function () {
  const jwt = require('jsonwebtoken')

  const verifyJwtToken = function __verifyJwtToken (req, res, next) {
    let authorizationHeader = req.headers.authorization
    if (!authorizationHeader) return res.status(401).send('Invalid authorization header')

    let jwtToken = authorizationHeader.split(' ')[1]
    if (!jwtToken) return res.status(401).send('Invalid JWT Token')

    let payload = null

    try {
      payload = jwt.verify(jwtToken, appDeployConfig.environment.jwtSecret)
    } catch (ex) {
      return res.status(401).send(ex.message)
    }

    if (!payload) return res.status(401).send('Invalid JWT payload')

    req.user_email = payload.email
    req.user_role = payload.role
    req.user_name = payload.name
    next()
  }

  const isAuthorized = (roles) => {
    return function __verifyAuthorization (req, res, next) {
      if (roles.includes(req.user_role)) return next()

      res.status(401).send('Not authorized by token')
    }
  }

  var mod = {
    isAuthorized: isAuthorized,
    verifyJwtToken: verifyJwtToken
  }

  return mod
}())
