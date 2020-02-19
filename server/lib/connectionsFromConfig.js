const _ = require('lodash');
const logger = require('./logger');
const drivers = require('../drivers');
const getConfigFromFile = require('./config/fromFile.js');
const [configFromFile] = getConfigFromFile() || {};

/**
 * Get connections from config.
 *
 * For environment variables:
 * connection env vars must follow the format:
 * SQLPAD_CONNECTIONS__<connectionId>__<connectionFieldName>
 *
 * <connectionId> can be any value to associate a grouping a fields to a connection instance
 * If supplying a connection that was previously defined in the nedb database,
 * this would map internally to connection._id object.
 *
 * <connectionFieldName> should be a field name identified in drivers.
 *
 * To define connections via envvars, `driver` field should be supplied.
 * _id field is not required, as it is defined in second env var fragment.
 *
 * Example: SQLPAD_CONNECTIONS__ab123__sqlserverEncrypt=""
 *
 * From file, resulting parsed configuration from file is expected to follow format `connections.<id>.<fieldname>`
 * {
 *   connections: {
 *     ab123: {
 *       sqlserverEncrypt: true
 *     }
 *   }
 * }
 *
 * @param {object} env
 * @returns {array<object>} arrayOfConnections
 */
function getConnectionsFromConfig(env = process.env) {
  // Create a map of connections from parsing environment variable
  const connectionsMapFromEnv = Object.keys(env)
    .filter(key => key.startsWith('SQLPAD_CONNECTIONS__'))
    .reduce((connectionsMap, envVar) => {
      // eslint-disable-next-line no-unused-vars
      const [prefix, id, field] = envVar.split('__');
      if (!connectionsMap[id]) {
        connectionsMap[id] = {};
      }
      connectionsMap[id][field] = env[envVar];
      return connectionsMap;
    }, {});

  // Get copy of connections from config file
  const { connections } = _.cloneDeep(configFromFile);

  // connections key from file matches format that is constructed from env
  // merge the 2 together then create an array out of them
  const connectionsMap = { ...connectionsMapFromEnv, ...connections };

  const connectionsFromConfig = [];
  Object.keys(connectionsMap).forEach(id => {
    try {
      let connection = connectionsMap[id];
      connection._id = id;
      connection = drivers.validateConnection(connection);
      connection.editable = false;
      connectionsFromConfig.push(connection);
    } catch (error) {
      logger.error(
        error,
        'Environment connection configuration failed for %s',
        id
      );
    }
  });
  return connectionsFromConfig;
}

module.exports = {
  getConnectionsFromConfig
};
