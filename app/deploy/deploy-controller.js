'use strict'

const express = require('express')
const router = express.Router()
const multer = require('multer')
const deployCTX = require('./deploy-context')

const upload = multer({ dest: '/tmp' })

router.get(
  '/',
  function __getDeployments (req, res, next) {
    res.json([ 'a', 'b' ])
  }
)

router.post(
  '/',
  upload.array('tarball', 1),
  function __createDeployment (req, res, next) {
    if (req.files.length === 0) return res.status(400).json('No tarball was uploaded')
    deployCTX.createDeployment(req.files[0], req.body)
      .then((deploy) => res.json(deploy))
      .catch(next)
  }
)

module.exports = router
