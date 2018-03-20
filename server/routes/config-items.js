const router = require('express').Router()
const mustBeAdmin = require('../middleware/must-be-admin.js')

router.get('/api/config-items', mustBeAdmin, function(req, res) {
  const { config } = req
  return res.json({
    configItems: config.getConfigItems()
  })
})

module.exports = router
