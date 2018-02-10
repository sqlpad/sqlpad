/*
  Gets default config values
  Some of these have special logic behind them, like dbPath
*/
const path = require('path')
const definitions = require('../../resources/configItems')

const userHome =
  process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME
const defaultDbPath = path.join(userHome, 'sqlpad/db')

const defaultMap = {}

definitions.forEach(definition => {
  if (definition.key === 'dbPath') {
    defaultMap.dbPath = defaultDbPath
  } else if (definition.hasOwnProperty('default')) {
    defaultMap[definition.key] = definition.default
  }
})

module.exports = defaultMap
