var router = require('express').Router()
var getVersion = require('../lib/get-version.js')

router.get('/api/version', function (req, res) {
  return res.json({
    version: getVersion()
  })
})

module.exports = router
