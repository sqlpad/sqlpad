const definitions = require('./config-items');
const path = require('path');
const fs = require('fs');

// This tracks environment variables that used to be supported but no longer are
// This is to assist erroring for old config no longer supported
const removedEnv = ['SQLPAD_DEBUG', 'SQLPAD_TABLE_CHART_LINKS_REQUIRE_AUTH'];

const userHome =
  process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
const oldConfigFilePath = path.join(userHome, '.sqlpadrc');
const oldDefaultDbPath = path.join(userHome, 'sqlpad/db');

let message = `
  "dbPath" not provided in config. 
  This was previously defaulted to ${oldDefaultDbPath}.
  This must now be explicitly set.`;

if (fs.existsSync(oldConfigFilePath)) {
  message += `
  This value may have been provided by old saved config file at ${oldConfigFilePath}. 
  Config file location must also now be provided explicitly.
  Use --config at command line or set environment variable SQLPAD_CONFIG
  `;
}

function getOldConfigWarning() {
  return message;
}

/**
 * Gets default config values
 * @returns {object} configMap
 */
function getFromDefault() {
  const defaultMap = {};

  definitions.forEach((definition) => {
    defaultMap[definition.key] = definition.default;
  });

  return defaultMap;
}

/**
 * Gets config values from environment
 * @param {object} env optional
 * @returns {object} configMap
 */
function getFromEnv(env) {
  return definitions
    .filter((definition) => definition.hasOwnProperty('envVar'))
    .reduce((envMap, definition) => {
      const { key, envVar } = definition;
      if (env[envVar]) {
        envMap[key] = env[envVar];
      }
      return envMap;
    }, {});
}

/**
 * Gets config values from argv param
 * @param {object} argv
 * @returns {object} configMap
 */
function getFromCli(argv) {
  return definitions.reduce((confMap, definition) => {
    const { key } = definition;

    if (argv[key] != null) {
      confMap[key] = argv[key];
    }

    return confMap;
  }, {});
}

module.exports = {
  getFromEnv,
  getFromDefault,
  getOldConfigWarning,
  getFromCli,
  removedEnv,
};
