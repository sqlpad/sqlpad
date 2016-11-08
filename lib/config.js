var ConfigItem = require('../models/ConfigItem.js')

// Simple convenience functions for getting the effectiveValue
// used other places in application to avoid lots of typing

var config = {

    // get effectiveValue for use around the application
  get: function getConfigItemValue (key) {
    var configItem = ConfigItem.findOneByKey(key)
    if (!configItem) throw new Error('config item ' + key + ' not defined in config-items.toml')
    return configItem.effectiveValue
  },

  getAllValues: function () {
    var configItems = ConfigItem.findAll()
    var allValues = {}
    configItems.forEach(function (item) {
      allValues[item.key] = item.effectiveValue
    })
    return allValues
  },

  smtpConfigured: function () {
    if (config.get('smtpHost') && config.get('smtpUser') && config.get('smtpFrom') && config.get('smtpPort') && config.get('publicUrl')) {
      return true
    } else {
      return false
    }
  },

  googleAuthConfigured: function () {
    if (config.get('publicUrl') && config.get('googleClientId') && config.get('googleClientSecret')) {
      return true
    } else {
      return false
    }
  }
}

module.exports = config
