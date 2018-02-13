const mysql = require('mysql')

function runQuery(query, connection, queryResult, callback) {
  const myConnection = mysql.createConnection({
    multipleStatements: true,
    host: connection.host,
    port: connection.port ? connection.port : 3306,
    user: connection.username,
    password: connection.password,
    database: connection.database,
    insecureAuth: connection.mysqlInsecureAuth,
    timezone: 'Z',
    supportBigNumbers: true
  })
  myConnection.connect(function(err) {
    if (err) {
      return callback(err, queryResult)
    }
    let rowCounter = 0
    let queryError
    let resultsSent = false
    function continueOn() {
      if (!resultsSent) {
        resultsSent = true
        callback(queryError, queryResult)
      }
    }
    const myQuery = myConnection.query(query)
    myQuery
      .on('error', function(err) {
        // Handle error,
        // an 'end' event will be emitted after this as well
        // so we'll call the callback there.
        queryError = err
      })
      .on('result', function(row) {
        rowCounter++
        if (rowCounter <= connection.maxRows) {
          // if we haven't hit the max yet add row to results
          queryResult.addRow(row)
        } else {
          // Too many rows! pause that connection.
          // It sounds like there is no way to close query stream
          // you just have to close the connection
          myConnection.pause()
          queryResult.incomplete = true
          continueOn() // return records to client before closing connection
          myConnection.end()
        }
      })
      .on('end', function() {
        // all rows have been received
        // This will not fire if we end the connection early
        continueOn()
        myConnection.end()
      })
  })
}

module.exports = {
  runQuery
}
