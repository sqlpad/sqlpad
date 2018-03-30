const { debug } = require('./config').getPreDbConfig()
const QueryResult = require('../models/QueryResult.js')
const createSocksConnection = require('./socks.js')

const clients = {
  mysql: require('../drivers/mysql').runQuery,
  crate: require('../drivers/crate').runQuery,
  presto: require('../drivers/presto').runQuery,
  postgres: require('../drivers/pg').runQuery,
  sqlserver: require('../drivers/mssql').runQuery,
  vertica: require('../drivers/vertica').runQuery,
  hdb: require('../drivers/hdb').runQuery
}

// TODO log this debug information in another format somewhere useful
function getInfo(connection, queryResult, query) {
  const resultRowCount =
    queryResult && queryResult.rows && queryResult.rows.length
      ? queryResult.rows.length
      : 0

  return `
--- lib/run-query.js ---
CONNECTION:  ${connection.name}
START TIME:  ${queryResult.startTime.toISOString()}
END TIME:    ${queryResult.stopTime.toISOString()}
ELAPSED MS:  ${queryResult.queryRunTime}
RESULT ROWS: ${resultRowCount}
QUERY: 
${query}
`
}

/**
 * Run query using driver implementation of connection
 * @param {*} query
 * @param {*} connection
 * @returns {Promise}
 */
module.exports = function runQuery(query, connection) {
  const queryResult = new QueryResult()
  queryResult.timerStart()
  const conn = Object.assign({}, connection, {
    stream: createSocksConnection(connection)
  })
  return clients[conn.driver](query, conn, queryResult).then(queryResult => {
    queryResult.timerStop()
    if (debug) {
      console.log(getInfo(conn, queryResult, query))
    }
    return queryResult
  })
}
