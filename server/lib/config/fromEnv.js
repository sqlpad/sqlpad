const definitions = require('./configItems')

/**
 * Gets config values from environment
 * @param {object} env optional
 * @returns {object} configMap
 */
module.exports = function getEnvConfig(env = process.env) {
  return definitions
    .filter(definition => definition.hasOwnProperty('envVar'))
    .reduce((envMap, definition) => {
      const { key, envVar } = definition
      if (env[envVar]) {
        envMap[key] = env[envVar]
      }
      return envMap
    }, {})
}
