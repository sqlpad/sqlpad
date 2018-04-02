const { debug } = require('./config').getPreDbConfig()
const QueryResult = require('../models/QueryResult.js')

const drivers = {
  mysql: require('../drivers/mysql'),
  crate: require('../drivers/crate'),
  presto: require('../drivers/presto'),
  postgres: require('../drivers/pg'),
  sqlserver: require('../drivers/mssql'),
  vertica: require('../drivers/vertica'),
  hdb: require('../drivers/hdb')
}

function logInfo(connection, queryResult, query) {
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
}

/**
 * Run query using driver implementation of connection
 * @param {*} query
 * @param {*} connection
 * @returns {Promise}
 */
module.exports = function runQuery(query, connection) {
  const driver = drivers[connection.driver]
  if (!driver.runQuery) {
    return Promise.reject(`${connection.driver}.runQuery() not implemented`)
  }
  return driver.runQuery(query, connection).then(queryResult => {
    if (!queryResult instanceof QueryResult) {
      throw new Error(`${connection.driver}.runQuery must return QueryResult`)
    }
    queryResult.finalize()
    logInfo(connection, queryResult, query)
    return queryResult
  })
}
