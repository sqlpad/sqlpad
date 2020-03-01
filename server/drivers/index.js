const utils = require('./utils');
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

/**
 * Validates connection object based on its driver
 * Unnecessary fields will be stripped out
 * @param {object} connection
 */
function validateConnection(connection) {
  const coreFields = ['_id', 'name', 'driver', 'createdDate', 'modifiedDate'];
  if (!connection.name) {
    throw new Error('connection.name required');
  }
  if (!connection.driver) {
    throw new Error('connection.driver required');
  }
  const driver = drivers[connection.driver];
  if (!driver) {
    throw new Error(`driver implementation ${connection.driver} not found`);
  }
  const validFields = driver.fields.map(field => field.key).concat(coreFields);
  const cleanedConnection = validFields.reduce(
    (cleanedConnection, fieldKey) => {
      if (connection.hasOwnProperty(fieldKey)) {
        let value = connection[fieldKey];
        const fieldDefinition = driver.fields.find(
          field => field.key === fieldKey
        );

        // field definition may not exist since
        // this could be a core field like _id, name
        if (fieldDefinition) {
          if (fieldDefinition.formType === 'CHECKBOX') {
            value = utils.ensureBoolean(value);
          }
        }

        cleanedConnection[fieldKey] = value;
      }
      return cleanedConnection;
    },
    {}
  );

  return cleanedConnection;
}

module.exports = {
  getDrivers,
  getSchema,
  renderConnection,
  runQuery,
  testConnection,
  validateConnection
};
