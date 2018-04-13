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

function requireValidate(path) {
  const driver = require(path)

  if (!driver.id) {
    console.error(`${path} must export a unique id`)
    process.exit(1)
  }

  if (!driver.name) {
    console.error(`${path} must export a name`)
    process.exit(1)
  }

  if (drivers[driver.id]) {
    console.error(`Driver with id ${driver.id} already loaded`)
    console.error(`Ensure ${path} has a unique id exported`)
    process.exit(1)
  }

  validateFunction(path, driver, 'getSchema')
  validateFunction(path, driver, 'runQuery')
  validateFunction(path, driver, 'testConnection')
  validateArray(path, driver, 'fields')

  driver.fieldsByKey = {}

  driver.fields.forEach(field => {
    driver.fieldsByKey[field.key] = field
  })

  drivers[driver.id] = driver
}

// Loads and validates drivers
// Will populate drivers {} map
requireValidate('../drivers/crate')
requireValidate('../drivers/hdb')
requireValidate('../drivers/mysql')
requireValidate('../drivers/pg')
requireValidate('../drivers/presto')
requireValidate('../drivers/mssql')
requireValidate('../drivers/vertica')

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
 * @param {string} [id]
 */
function getDrivers(id) {
  if (id) {
    if (!drivers[id]) {
      throw new Error(`Driver ${id} does not exist`)
    }
    return {
      id,
      name: drivers[id].name,
      fields: drivers[id].fields
    }
  }
  return Object.keys(drivers).map(id => {
    return {
      id,
      name: drivers[id].name,
      fields: drivers[id].fields
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
