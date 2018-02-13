const hdb = require('hdb')

exports.runQuery = function(query, connection, queryResult, callback) {
  const client = hdb.createClient({
    host: connection.host,
    port: connection.hanaport,
    database: connection.hanadatabase,
    user: connection.username,
    password: connection.password,
    schema: connection.hanaSchema
  })
  client.on('error', function(err) {
    console.error('Network connection error', err)
  })
  client.connect(function(err) {
    if (err) {
      console.error('Connect error', err)
      return callback(err, queryResult)
    }
    client.exec(query, function(err, rows) {
      queryResult.addRows(rows)
      client.disconnect()
      callback(err, queryResult)
    })
  })
}
