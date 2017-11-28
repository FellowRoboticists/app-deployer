'use strict'

var express = require('express')
var router = express.Router()

const userCTX = require('./user-context')
const userMW = require('./user-middleware')
const sessionMW = require('../session/session-middleware')
const generalMW = require('../utility/general-middleware')

router.param('user', userMW.userIdParam)

router.get(
  '/',
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer', 'reporter']),
  function __getUsers (req, res, next) {
    userCTX.getUsers()
      .then((users) => res.json(users))
      .catch(next)
  }
)

router.get(
  `/:user(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin', 'deployer', 'reporter']),
  function __getUser (req, res, next) {
    res.json(req.user)
  }
)

router.post(
  '/',
  function __createUser (req, res, next) {
    userCTX.createUser(req.body)
      .then((user) => res.json(user))
      .catch(next)
  }
)

router.put(
  `/:user(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin']),
  function __updateUser (req, res, next) {
    userCTX.updateUser(req.user, req.body)
      .then((user) => res.json(user))
      .catch(next)
  }
)

router.put(
  `/:user(${generalMW.dbId})/change_password`,
  sessionMW.verifyJwtToken,
  userMW.loggedInUser,
  function __changeUserPassword (req, res, next) {
    userCTX.changeUserPassword(req.user, req.body.password, req.body.newPassword)
      .then((user) => res.json(user))
      .catch(next)
  }
)

router.delete(
  `/:user(${generalMW.dbId})`,
  sessionMW.verifyJwtToken,
  sessionMW.isAuthorized(['admin']),
  function __deleteUser (req, res, next) {
    userCTX.deleteUser(req.user)
      .then((user) => res.json(user))
      .catch(next)
  }
)

module.exports = router
