const { debug } = require('../lib/config').getPreDbConfig()
const QueryResult = require('../models/QueryResult.js')

function validateFunction(path, driver, functionName) {
  if (typeof driver[functionName] !== 'function') {
    console.error(`${path} missing .${functionName}() implementation`)
    process.exit(1)
  }
}

function requireValidate(path) {
  const driver = require(path)
  validateFunction(path, driver, 'runQuery')
  validateFunction(path, driver, 'testConnection')
  return driver
}

const drivers = {
  mysql: requireValidate('../drivers/mysql'),
  crate: requireValidate('../drivers/crate'),
  presto: requireValidate('../drivers/presto'),
  postgres: requireValidate('../drivers/pg'),
  sqlserver: requireValidate('../drivers/mssql'),
  vertica: requireValidate('../drivers/vertica'),
  hdb: requireValidate('../drivers/hdb')
}

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

module.exports = {
  runQuery,
  testConnection
}
