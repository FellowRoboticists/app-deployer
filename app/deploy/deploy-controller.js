'use strict'

const express = require('express')
const router = express.Router()

router.get(
  '/',
  function __getDeployments (req, res, next) {
    res.json([ 'a', 'b' ])
  }
)

module.exports = router
