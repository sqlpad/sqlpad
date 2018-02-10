const fs = require('fs')
const path = require('path')
const definitions = require('../../resources/configItems')

const userHome =
  process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME
const filePath = path.join(userHome, '.sqlpadrc')

const rcJson = fs.existsSync(filePath)
  ? JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }))
  : {}

/**
 * Gets config values from file (saved cli)
 * @param {object} fileConf optional
 * @returns {object} configMap
 */
module.exports = function getFileConfig(fileConf = rcJson) {
  return definitions
    .filter(definition => definition.hasOwnProperty('cliFlag'))
    .reduce((confMap, definition) => {
      const { key, cliFlag } = definition

      // cliFlag could have multiple flags defined
      // TODO make consistent then deprecate old ones
      const flags = Array.isArray(cliFlag) ? cliFlag : [cliFlag]
      flags.forEach(flag => {
        if (fileConf[flag] != null) {
          confMap[key] = fileConf[flag]
        }
      })
      return confMap
    }, {})
}
