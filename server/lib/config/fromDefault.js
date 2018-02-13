const path = require('path')
const definitions = require('./configItems')

/**
 * Gets default config values
 * dbPath gets a default based on USERPROFILE/HOME
 * @returns {object} configMap
 */
module.exports = function getDefaultConfig() {
  const defaultMap = {}

  definitions.forEach(definition => {
    if (definition.key === 'dbPath') {
      const userHome =
        process.platform === 'win32'
          ? process.env.USERPROFILE
          : process.env.HOME
      const defaultDbPath = path.join(userHome, 'sqlpad/db')
      defaultMap.dbPath = defaultDbPath
    } else if (definition.hasOwnProperty('default')) {
      defaultMap[definition.key] = definition.default
    }
  })

  return defaultMap
}
