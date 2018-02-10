/*
  Gets config values from cli
*/
const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))
const definitions = require('../../resources/configItems')

const configMap = definitions
  .filter(definition => definition.hasOwnProperty('cliFlag'))
  .reduce((confMap, definition) => {
    const { key, cliFlag } = definition

    // cliFlag could have multiple flags defined
    // TODO make consistent then deprecate old ones
    const flags = Array.isArray(cliFlag) ? cliFlag : [cliFlag]
    flags.forEach(flag => {
      if (argv[flag] != null) {
        confMap[key] = argv[flag]
      }
    })
    return confMap
  }, {})

module.exports = configMap
