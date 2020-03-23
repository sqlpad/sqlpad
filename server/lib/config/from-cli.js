const definitions = require('./config-items');

/**
 * Gets config values from argv param
 * @param {object} argv
 * @returns {object} configMap
 */
module.exports = function getCliConfig(argv) {
  return definitions.reduce((confMap, definition) => {
    const { key } = definition;

    if (argv[key] != null) {
      confMap[key] = argv[key];
    }

    return confMap;
  }, {});
};
