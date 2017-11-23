'use strict'

module.exports = (function () {
  const requireDir = require('require-dir')

  let configurations = requireDir('./config')

  global.appDeployConfig = configurations

  var mod = {
  }

  return mod
}())
