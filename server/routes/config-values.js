const router = require('express').Router()
const mustBeAdmin = require('../middleware/must-be-admin.js')

router.get('/api/config-items', mustBeAdmin, function(req, res) {
  const { config } = req
  return res.json({
    configItems: config.getConfigItems()
  })
})

router.post('/api/config-values/:key', mustBeAdmin, function(req, res) {
  const { body, config, params } = req
  config
    .save(params.key, body.value)
    .then(() => res.json({}))
    .catch(error => {
      console.error(error)
      return res.json({
        error: 'Problem saving config value'
      })
    })
})

module.exports = router
