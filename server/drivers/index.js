const { debug } = require('../lib/config').getPreDbConfig()
const QueryResult = require('../models/QueryResult.js')
const decipher = require('../lib/decipher')
const utils = require('./utils')

function validateFunction(path, driver, functionName) {
  if (typeof driver[functionName] !== 'function') {
    console.error(`${path} missing .${functionName}() implementation`)
    process.exit(1)
  }
}

function validateArray(path, driver, arrayName) {
  const arr = driver[arrayName]
  if (!Array.isArray(arr)) {
    console.error(`${path} missing ${arrayName} array`)
    process.exit(1)
  }
}

const drivers = {}

function requireValidate(driverName, path) {
  if (drivers[driverName]) {
    throw new Error(`${driverName} already loaded`)
  }

  const driver = require(path)
  validateFunction(path, driver, 'getSchema')
  validateFunction(path, driver, 'runQuery')
  validateFunction(path, driver, 'testConnection')
  validateArray(path, driver, 'fields')

  driver.fieldsByKey = {}

  driver.fields.forEach(field => {
    driver.fieldsByKey[field.key] = field
  })

  drivers[driverName] = driver
}

// Loads and validates drivers
// Will populate drivers {} map
requireValidate('crate', '../drivers/crate')
requireValidate('hdb', '../drivers/hdb')
requireValidate('mysql', '../drivers/mysql')
requireValidate('postgres', '../drivers/pg')
requireValidate('presto', '../drivers/presto')
requireValidate('sqlserver', '../drivers/mssql')
requireValidate('vertica', '../drivers/vertica')

/**
 * Run query using driver implementation of connection
 * @param {*} query
 * @param {*} connection
 * @returns {Promise}
 */
function runQuery(query, connection) {
  const driver = drivers[connection.driver]

  return driver.runQuery(query, connection).then(queryResult => {
    if (!queryResult instanceof QueryResult) {
      throw new Error(`${connection.driver}.runQuery() must return QueryResult`)
    }
    queryResult.finalize()

    if (debug) {
      const connectionName = connection.name
      const rowCount =
        queryResult && queryResult.rows ? queryResult.rows.length : 0
      const { startTime, stopTime, queryRunTime } = queryResult

      console.log(
        JSON.stringify({
          connectionName,
          startTime,
          stopTime,
          queryRunTime,
          rowCount,
          query
        })
      )
    }

    return queryResult
  })
}

function testConnection(connection) {
  const driver = drivers[connection.driver]
  return driver.testConnection(connection)
}

/**
 * Gets schema for connection
 * @param {*} connection
 * @returns {Promise}
 */
function getSchema(connection) {
  connection.username = decipher(connection.username)
  connection.password = decipher(connection.password)
  connection.maxRows = Number.MAX_SAFE_INTEGER
  const driver = drivers[connection.driver]
  return driver.getSchema(connection)
}

/**
 * @param {string} [driverName]
 */
function getDrivers(driverName) {
  if (driverName) {
    if (!drivers[driverName]) {
      throw new Error(`Driver ${driverName} does not exist`)
    }
    return {
      name: driverName,
      fields: drivers[driverName].fields
    }
  }
  return Object.keys(drivers).map(driverName => {
    return {
      name: driverName,
      fields: drivers[driverName].fields
    }
  })
}

/**
 * Validates connection object based on its driver
 * Unnecessary fields will be stripped out
 * @param {object} connection
 */
function validateConnection(connection) {
  const coreFields = ['_id', 'name', 'driver', 'createdDate', 'modifiedDate']
  if (!connection.name) {
    throw new Error('connection.name required')
  }
  if (!connection.driver) {
    throw new Error('connection.driver required')
  }
  const driver = drivers[connection.driver]
  if (!driver) {
    throw new Error(`driver implementation ${connection.driver} not found`)
  }
  const validFields = driver.fields.map(field => field.key).concat(coreFields)
  const cleanedConnection = validFields.reduce(
    (cleanedConnection, fieldKey) => {
      if (connection.hasOwnProperty(fieldKey)) {
        let value = connection[fieldKey]
        const fieldDefinition = drivers[connection.driver].fieldsByKey[fieldKey]

        // field definition may not exist since
        // this could be a core field like _id, name
        if (fieldDefinition) {
          if (fieldDefinition.formType === 'CHECKBOX') {
            value = utils.ensureBoolean(value)
          }
        }

        cleanedConnection[fieldKey] = value
      }
      return cleanedConnection
    },
    {}
  )

  return cleanedConnection
}

// TODO add API route to get drivers
// TODO change connection saving to be function driven

module.exports = {
  getDrivers,
  getSchema,
  runQuery,
  testConnection,
  validateConnection
}
