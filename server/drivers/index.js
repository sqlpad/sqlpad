const uuid = require('uuid');
const config = require('../lib/config');
const utils = require('./utils');
const getMeta = require('../lib/getMeta');
const logger = require('../lib/logger');

const drivers = {};

/**
 * Validate that the driver implementation has a function by name provided
 * @param {string} path
 * @param {object} driver
 * @param {string} functionName
 */
function validateFunction(path, driver, functionName) {
  if (typeof driver[functionName] !== 'function') {
    logger.error(`${path} missing .${functionName}() implementation`);
    process.exit(1);
  }
}

/**
 * Validate that the driver implementation has an array by name provided
 * @param {string} path
 * @param {object} driver
 * @param {string} arrayName
 */
function validateArray(path, driver, arrayName) {
  const arr = driver[arrayName];
  if (!Array.isArray(arr)) {
    logger.error(`${path} missing ${arrayName} array`);
    process.exit(1);
  }
}

/**
 * Require driver implementation for provided path
 * and validate that it meets implementation spec as possible
 * @param {string} path
 */
function requireValidate(path, optional = false) {
  let driver;

  try {
    driver = require(path);
  } catch (er) {
    if (optional) {
      logger.debug('optional driver ' + path + ' not available');
      return;
    } else {
      // rethrow
      throw er;
    }
  }

  if (!driver.id) {
    logger.fatal(`${path} must export a unique id`);
    process.exit(1);
  }

  if (!driver.name) {
    logger.fatal(`${path} must export a name`);
    process.exit(1);
  }

  if (drivers[driver.id]) {
    logger.fatal(`Driver with id ${driver.id} already loaded`);
    logger.fatal(`Ensure ${path} has a unique id exported`);
    process.exit(1);
  }

  validateFunction(path, driver, 'getSchema');
  validateFunction(path, driver, 'runQuery');
  validateFunction(path, driver, 'testConnection');
  validateArray(path, driver, 'fields');

  driver.fieldsByKey = {};

  driver.fields.forEach(field => {
    driver.fieldsByKey[field.key] = field;
  });

  drivers[driver.id] = driver;
}

// Loads and validates drivers
// Will populate drivers {} map
requireValidate('../drivers/crate');
requireValidate('../drivers/drill');
requireValidate('../drivers/hdb');
requireValidate('../drivers/mysql');
requireValidate('../drivers/postgres');
requireValidate('../drivers/presto');
requireValidate('../drivers/sqlserver');
requireValidate('../drivers/unixodbc', true);
requireValidate('../drivers/vertica');
requireValidate('../drivers/cassandra');

if (process.env.SQLPAD_TEST === 'true') {
  requireValidate('../drivers/mock');
}

/**
 * Run query using driver implementation of connection
 * @param {*} query
 * @param {*} connection
 * @param {object} [user] user may not be provided if chart links turned on
 * @returns {Promise}
 */
function runQuery(query, connection, user) {
  const driver = drivers[connection.driver];

  const queryResult = {
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

  return driver.runQuery(query, connection).then(results => {
    const { rows, incomplete } = results;
    if (!Array.isArray(rows)) {
      throw new Error(`${connection.driver}.runQuery() must return rows array`);
    }

    queryResult.incomplete = incomplete || false;
    queryResult.rows = rows;
    queryResult.stopTime = new Date();
    queryResult.queryRunTime = queryResult.stopTime - queryResult.startTime;
    queryResult.meta = getMeta(rows);
    queryResult.fields = Object.keys(queryResult.meta);
    const { startTime, stopTime, queryRunTime } = queryResult;

    logger.info(
      {
        user_id: user && user._id,
        user_email: user && user.email,
        connection_name: connection.name,
        start_time: startTime,
        stop_time: stopTime,
        query_run_time: queryRunTime,
        row_count: rows.length
      },
      query
    );

    return queryResult;
  });
}

/**
 * Test connection passed in using the driver implementation
 * As long as promise resolves without error
 * it is considered a successful connection config
 * @param {object} connection
 */
function testConnection(connection) {
  const driver = drivers[connection.driver];
  return driver.testConnection(connection);
}

/**
 * Gets schema (sometimes called schemaInfo) for connection
 * This data is used by client to build schema tree in editor sidebar
 * @param {object} connection
 * @returns {Promise}
 */
function getSchema(connection) {
  connection.maxRows = Number.MAX_SAFE_INTEGER;
  const driver = drivers[connection.driver];
  return driver.getSchema(connection);
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
        const fieldDefinition =
          drivers[connection.driver].fieldsByKey[fieldKey];

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
  runQuery,
  testConnection,
  validateConnection
};
