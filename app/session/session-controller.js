'use strict'

const express = require('express')
const router = express.Router()

const sessionCTX = require('./session-context')

router.post(
  '/',
  function __login (req, res, next) {
    sessionCTX.login(req.body.email, req.body.password)
      .then((token) => res.json({ token: token }))
      .catch(next)
  }
)

module.exports = router
