const router = require('express').Router()
const mustBeAdmin = require('../middleware/must-be-admin.js')

router.get('/api/config-items', mustBeAdmin, function(req, res) {
  const { config } = req

  const configItems = config.getItems().map(function(item) {
    if (item.sensitive && item.interface === 'env') {
      item.effectiveValue = item.effectiveValue ? '**********' : ''
      item.dbValue = item.dbValue ? '**********' : ''
      item.default = item.default ? '**********' : ''
      item.envValue = item.envValue ? '**********' : ''
      item.cliValue = item.cliValue ? '**********' : ''
      item.savedCliValue = item.savedCliValue ? '**********' : ''
    }
    return item
  })

  return res.json({
    configItems: configItems
  })
})

router.post('/api/config-values/:key', mustBeAdmin, function(req, res) {
  const { config } = req
  const key = req.params.key
  const value = req.body.value
  config
    .save(key, value)
    .then(() => res.json({}))
    .catch(error => {
      console.error(error)
      return res.json({
        error: 'Problem saving config value'
      })
    })
})

module.exports = router
