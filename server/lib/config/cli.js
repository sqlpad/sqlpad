/*
  Gets config values from cli
*/
const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))
const definitions = require('../../resources/configItems')

/**
 * Gets config values from file (saved cli)
 * @param {object} argvConf optional
 * @returns {object} configMap
 */
module.exports = function getCliConfig(argvConf = argv) {
  return definitions
    .filter(definition => definition.hasOwnProperty('cliFlag'))
    .reduce((confMap, definition) => {
      const { key, cliFlag } = definition

      // cliFlag could have multiple flags defined
      // TODO make consistent then deprecate old ones
      const flags = Array.isArray(cliFlag) ? cliFlag : [cliFlag]
      flags.forEach(flag => {
        if (argvConf[flag] != null) {
          confMap[key] = argvConf[flag]
        }
      })
      return confMap
    }, {})
}
