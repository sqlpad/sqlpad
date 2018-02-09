const ConfigItem = require('../models/ConfigItem.js')

// Simple convenience functions for getting the effectiveValue
const config = {
  get: function getConfigItemValue(key) {
    const configItem = ConfigItem.findOneByKey(key)
    if (!configItem) {
      throw new Error(`config item ${key} not defined in configItems.js`)
    }
    return configItem.effectiveValue
  },

  smtpConfigured: function() {
    if (
      config.get('smtpHost') &&
      config.get('smtpUser') &&
      config.get('smtpFrom') &&
      config.get('smtpPort') &&
      config.get('publicUrl')
    ) {
      return true
    } else {
      return false
    }
  },

  googleAuthConfigured: function() {
    if (
      config.get('publicUrl') &&
      config.get('googleClientId') &&
      config.get('googleClientSecret')
    ) {
      return true
    } else {
      return false
    }
  }
}

module.exports = config
