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

module.exports = function runQuery(query, connection, callback) {
  var queryResult = new QueryResult()
  queryResult.timerStart()
  var conn = Object.assign({}, connection, {
    stream: createSocksConnection(connection)
  })
  clients[conn.driver](query, conn, queryResult, function(err, queryResult) {
    queryResult.timerStop()
    if (debug) {
      var resultRowCount =
        queryResult && queryResult.rows && queryResult.rows.length
          ? queryResult.rows.length
          : 0
      console.log('\n--- lib/run-query.js ---')
      console.log('CONNECTION: ' + conn.name)
      console.log('START TIME: ' + queryResult.startTime.toISOString())
      console.log('END TIME: ' + queryResult.stopTime.toISOString())
      console.log('ELAPSED MS: ' + queryResult.queryRunTime)
      console.log('RESULT ROWS: ' + resultRowCount)
      console.log('QUERY: ')
      console.log(query)
      console.log()
    }
    callback(err, queryResult)
  })
}
