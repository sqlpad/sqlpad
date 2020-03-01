const DriverConnection = require('./driver-connection');

/**
 * Run query using driver implementation of connection
 * @param {*} query
 * @param {*} connection
 * @param {object} [user] user may not be provided if chart links turned on
 * @returns {Promise}
 */
async function runQuery(query, connection, user) {
  const driverConnection = new DriverConnection(connection, user);
  return driverConnection.runQuery(query);
}

/**
 * Test connection passed in using the driver implementation
 * As long as promise resolves without error
 * it is considered a successful connection config
 * @param {object} connection
 * @param {object} user
 */
function testConnection(connection, user) {
  const driverConnection = new DriverConnection(connection, user);
  return driverConnection.testConnection();
}

/**
 * Gets schema (sometimes called schemaInfo) for connection
 * This data is used by client to build schema tree in editor sidebar
 * @param {object} connection
 * @param {object} user
 * @returns {Promise}
 */
function getSchema(connection, user) {
  const driverConnection = new DriverConnection(connection, user);
  return driverConnection.getSchema();
}

module.exports = {
  getSchema,
  runQuery,
  testConnection
};
