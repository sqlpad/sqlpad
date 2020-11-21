const definitions = require('./config-items');
const path = require('path');
const fs = require('fs');

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

function isConnectionEnv(key = '') {
  return key.startsWith('SQLPAD_CONNECTIONS__');
}

/**
 * Parse connection env keys into key-value objects
 * Values contain only that defined in environment variables
 * This does not validate or clean the data in any way
 *
 * Connection environment variables follow the format:
 * SQLPAD_CONNECTIONS__<connectionId>__<connectionFieldName>
 *
 * Example: SQLPAD_CONNECTIONS__ab123__sqlserverEncrypt=""
 *
 * @param {object} env
 */
function parseConnectionsFromEnv(env) {
  const connectionsMap = Object.keys(env)
    .filter((key) => key.startsWith('SQLPAD_CONNECTIONS__'))
    .reduce((connectionsMap, envVar) => {
      // eslint-disable-next-line no-unused-vars
      const [prefix, id, field] = envVar.split('__');
      if (!connectionsMap[id]) {
        connectionsMap[id] = {};
      }
      connectionsMap[id][field] = env[envVar];
      return connectionsMap;
    }, {});

  const connectionsFromConfig = Object.entries(connectionsMap).map(
    ([id, connection]) => {
      connection.id = id;
      return connection;
    }
  );

  return connectionsFromConfig;
}

module.exports = {
  getFromEnv,
  getFromDefault,
  getOldConfigWarning,
  getFromCli,
  isConnectionEnv,
  parseConnectionsFromEnv,
};
