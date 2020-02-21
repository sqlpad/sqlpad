const uuid = require('uuid');
const _ = require('lodash');
const utils = require('./utils');
const getMeta = require('../lib/getMeta');
const appLog = require('../lib/appLog');

const drivers = {};

/**
 * Validate that the driver implementation has a function by name provided
 * @param {string} path
 * @param {object} driver
 * @param {string} functionName
 */
function validateFunction(path, driver, functionName) {
  if (typeof driver[functionName] !== 'function') {
    appLog.error('%s missing .%s() implementation', path, functionName);
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
    appLog.error('%s missing %s array', path, arrayName);
    process.exit(1);
  }
}

/**
 * Iterates over connection object, replacing any template strings with values from user
 * This allows dynamic values inserted based on logged in user
 * This uses a mustache-like syntax, using double mustaches.
 * User variables can be referenced in connection strings using dot notation
 * Example: {{user.someKey}} and {{user.data.someKey}}
 * @param {object} connection
 * @param {object} user
 */
function renderConnection(connection, user) {
  const replaced = {};
  Object.keys(connection).forEach(key => {
    const value = connection[key];
    if (typeof value === 'string') {
      _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
      const compiled = _.template(value);
      replaced[key] = compiled({ user });
    } else {
      replaced[key] = value;
    }
  });
  return replaced;
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
      appLog.info('optional driver %s not available', path);
      return;
    } else {
      // rethrow
      throw er;
    }
  }

  if (!driver.id) {
    appLog.error('%s must export a unique id', path);
    process.exit(1);
  }

  if (!driver.name) {
    appLog.error('%s must export a name', path);
    process.exit(1);
  }

  if (drivers[driver.id]) {
    appLog.error(`Driver with id ${driver.id} already loaded`);
    appLog.error(`Ensure ${path} has a unique id exported`);
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
requireValidate('./crate');
requireValidate('./drill');
requireValidate('./hdb');
requireValidate('./mysql');
requireValidate('./postgres');
requireValidate('./presto');
requireValidate('./sqlserver');
requireValidate('./unixodbc', true);
requireValidate('./vertica');
requireValidate('./cassandra');
requireValidate('./snowflake');
requireValidate('./mock');

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

  const renderedConnection = renderConnection(connection, user);

  return driver.runQuery(query, renderedConnection).then(results => {
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

    const connectionName = renderedConnection.name;
    const rowCount = rows.length;
    const { startTime, stopTime, queryRunTime } = queryResult;

    appLog.info({
      userId: user && user._id,
      userEmail: user && user.email,
      connectionId: connection._id,
      connectionName,
      startTime,
      stopTime,
      queryRunTime,
      rowCount,
      query
    });

    return queryResult;
  });
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
  renderConnection,
  runQuery,
  testConnection,
  validateConnection
};
