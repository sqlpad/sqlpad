const ConfigItem = require('../models/ConfigItem.js')
const router = require('express').Router()
const mustBeAdmin = require('../middleware/must-be-admin.js')
const _ = require('lodash')

router.get('/api/config-items', mustBeAdmin, function(req, res) {
  let configItems = _.cloneDeep(ConfigItem.findAll())
  configItems = configItems.map(function(item) {
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
  const key = req.params.key
  const value = req.body.value
  const configItem = ConfigItem.findOneByKey(key)
  configItem.setDbValue(value)
  configItem.save(function(err) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem saving config value'
      })
    }
    return res.json({})
  })
})

module.exports = router
