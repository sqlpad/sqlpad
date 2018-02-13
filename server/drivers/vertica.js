const vertica = require('vertica')

exports.runQuery = function(query, connection, queryResult, callback) {
  const params = {
    host: connection.host,
    port: connection.port ? connection.port : 5433,
    user: connection.username,
    password: connection.password,
    database: connection.database
  }
  const client = vertica.connect(params, function(err) {
    if (err) {
      callback(err, queryResult)
      client.disconnect()
    } else {
      let finished = false
      let rowCounter = 0
      const fields = []

      const verticaQuery = client.query(query)

      verticaQuery.on('fields', function(f) {
        for (const i in f) {
          if (f.hasOwnProperty(i)) {
            fields.push(f[i]['name'])
          }
        }
      })

      verticaQuery.on('row', function(row) {
        if (rowCounter < connection.maxRows) {
          const resultRow = {}
          for (const item in row) {
            if (row.hasOwnProperty(item)) {
              resultRow[fields[item]] = row[item]
            }
          }
          queryResult.addRow(resultRow)
          rowCounter++
        } else {
          if (!finished) {
            finished = true
            client.disconnect()
            queryResult.incomplete = true
            callback(err, queryResult)
          }
        }
      })

      verticaQuery.on('end', function() {
        if (!finished) {
          finished = true
          client.disconnect()
          callback(err, queryResult)
        }
      })

      verticaQuery.on('error', function(err) {
        if (!finished) {
          finished = true
          client.disconnect()
          callback(err, queryResult)
        }
      })
    }
  })
}
