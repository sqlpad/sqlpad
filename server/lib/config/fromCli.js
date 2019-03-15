const definitions = require('./configItems');

/**
 * Gets config values from argv param
 * @param {object} argv
 * @returns {object} configMap
 */
module.exports = function getCliConfig(argv) {
  return definitions
    .filter(definition => definition.hasOwnProperty('cliFlag'))
    .reduce((confMap, definition) => {
      const { key, cliFlag } = definition;

      // cliFlag could have multiple flags defined
      // TODO make consistent then deprecate old ones
      const flags = Array.isArray(cliFlag) ? cliFlag : [cliFlag];
      flags.forEach(flag => {
        if (argv[flag] != null) {
          confMap[key] = argv[flag];
        }
      });
      return confMap;
    }, {});
};
