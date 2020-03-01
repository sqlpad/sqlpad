const uuid = require('uuid');
const utils = require('./utils');
const getMeta = require('../lib/getMeta');
const appLog = require('../lib/appLog');
const validate = require('./validate');
const renderConnection = require('./render-connection');

const drivers = {
  crate: require('./crate'),
  drill: require('./drill'),
  hdb: require('./hdb'),
  mock: require('./mock'),
  mysql: require('./mysql'),
  postgres: require('./postgres'),
  presto: require('./presto'),
  sqlserver: require('./sqlserver'),
  vertica: require('./vertica'),
  cassandra: require('./cassandra'),
  snowflake: require('./snowflake')
};

// unixodbc is an optional dependency due to it needing to be compiled
// (and lacks prebuilt binaries like sqlite provides)
try {
  drivers.unixodbc = require('./unixodbc');
} catch (error) {
  appLog.info('ODBC driver not available');
}

// Validate each driver implementation to ensure it matches expectations
Object.keys(drivers).forEach(id => {
  const driver = drivers[id];
  validate(id, driver);
});

/**
 * Run query using driver implementation of connection
 * @param {*} query
 * @param {*} connection
 * @param {object} [user] user may not be provided if chart links turned on
 * @returns {Promise}
 */
async function runQuery(query, connection, user) {
  const driver = drivers[connection.driver];

  const finalResult = {
    id: uuid.v4(),
    cacheKey: null,
    startTime: new Date(),
    stopTime: null,
    queryRunTime: null,
    fields: [],
    incomplete: false,
    meta: {},
    rows: []
  };

  const renderedConnection = renderConnection(connection, user);
  const connectionName = renderedConnection.name;

  appLog.debug(
    {
      originalConnection: connection,
      renderedConnection,
      user
    },
    'Rendered connection for user'
  );

  const queryContext = {
    driver: connection.driver,
    userId: user && user._id,
    userEmail: user && user.email,
    connectionId: connection._id,
    connectionName,
    query,
    startTime: finalResult.startTime
  };

  appLog.info(queryContext, 'Running query');

  let results;
  try {
    results = await driver.runQuery(query, renderedConnection);
  } catch (error) {
    // It is logged INFO because it isn't necessarily a server/application error
    // It could just be a bad query
    appLog.info(
      { ...queryContext, error: error.toString() },
      'Error running query'
    );

    // Rethrow the error
    // The error here is something expected and should be shown to user
    throw error;
  }

  let { rows, incomplete, suppressedResultSet } = results;

  if (!Array.isArray(rows)) {
    appLog.warn(
      {
        driver: connection.driver,
        connectionId: connection._id,
        connectionName,
        query
      },
      'Expected rows to be an array but received %s.',
      typeof rows
    );
    rows = [];
  }

  finalResult.incomplete = Boolean(incomplete);
  finalResult.suppressedResultSet = Boolean(suppressedResultSet);
  finalResult.rows = rows;
  finalResult.stopTime = new Date();
  finalResult.queryRunTime = finalResult.stopTime - finalResult.startTime;
  finalResult.meta = getMeta(rows);
  finalResult.fields = Object.keys(finalResult.meta);

  appLog.info(
    {
      ...queryContext,
      stopTime: finalResult.stopTime,
      queryRunTime: finalResult.queryRunTime,
      rowCount: rows.length,
      incomplete: finalResult.incomplete,
      suppressedResultSet: finalResult.suppressedResultSet
    },
    'Query finished'
  );

  return finalResult;
}

/**
 * Test connection passed in using the driver implementation
 * As long as promise resolves without error
 * it is considered a successful connection config
 * @param {object} connection
 * @param {object} user
 */
function testConnection(connection, user) {
  const driver = drivers[connection.driver];
  const renderedConnection = renderConnection(connection, user);
  return driver.testConnection(renderedConnection);
}

/**
 * Gets schema (sometimes called schemaInfo) for connection
 * This data is used by client to build schema tree in editor sidebar
 * @param {object} connection
 * @param {object} user
 * @returns {Promise}
 */
function getSchema(connection, user) {
  connection.maxRows = Number.MAX_SAFE_INTEGER;
  const driver = drivers[connection.driver];
  const renderedConnection = renderConnection(connection, user);
  return driver.getSchema(renderedConnection);
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
