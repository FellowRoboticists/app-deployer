'use strict'

module.exports = (function () {
  const sqlSVC = require('../sql/sql-service')

  const userIdParam = function __userIdParam (req, res, next, id) {
    sqlSVC.selectUserById(id)
      .then((user) => {
        req.user = user
        next()
      })
  }

  const loggedInUser = function __loggedInUser (req, res, next) {
    if (!req.user) return next(new Error('No user specified'))
    if (!req.user_email) return next(new Error('No current user email'))
    if (req.user.email === req.user_email) return next()

    res.status(401).send('Not logged-in user')
  }

  var mod = {
    loggedInUser: loggedInUser,
    userIdParam: userIdParam
  }

  return mod
}())
