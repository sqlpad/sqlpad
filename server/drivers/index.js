const renderConnection = require('./render-connection');
const drivers = require('./drivers');
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

/**
 * Gets array of driver objects
 * @returns {array} drivers
 */
function getDrivers() {
  return Object.keys(drivers).map(id => {
    return {
      id,
      name: drivers[id].name,
      fields: drivers[id].fields
    };
  });
}

module.exports = {
  getDrivers,
  getSchema,
  renderConnection,
  runQuery,
  testConnection
};
