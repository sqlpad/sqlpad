/*
  Gets config values from environment
*/
const definitions = require('../../resources/configItems')

const envConfigMap = definitions
  .filter(definition => definition.hasOwnProperty('envVar'))
  .reduce((envMap, definition) => {
    const { key, envVar } = definition
    if (process.env[envVar]) {
      envMap[key] = process.env[envVar]
    }
    return envMap
  }, {})

module.exports = envConfigMap
