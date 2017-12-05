'use strict'

module.exports = (function () {
  const consoleError = (err) => {
    if (err.name === 'StatusCodeError') {
      // This came with a non-200 response from the
      // request.
      console.error(err.message)
    } else {
      console.error(err.stack || err)
    }
  }

  var mod = {
    consoleError: consoleError
  }

  return mod
}())
