const presto = require('./presto.js')

exports.runQuery = function(query, connection, queryResult, callback) {
  const port = connection.port || 8080
  const prestoConfig = {
    url: `http://${connection.host}:${port}`,
    user: connection.username,
    catalog: connection.prestoCatalog,
    schema: connection.prestoSchema
  }
  return presto
    .send(prestoConfig, query)
    .then(result => {
      if (!result) {
        const missingResult = 'No result returned'
        return callback(missingResult, queryResult)
      }
      let { data, columns, error } = result
      if (error) {
        return callback(error.message, queryResult)
      }
      if (data.length > connection.maxRows) {
        queryResult.incomplete = true
        data = data.slice(0, connection.maxRows)
      }
      for (var r = 0; r < data.length; r++) {
        var row = {}
        for (var c = 0; c < columns.length; c++) {
          row[columns[c].name] = data[r][c]
        }
        queryResult.addRow(row)
      }
      return callback(null, queryResult)
    })
    .catch(error => {
      console.error({ error })
      return callback(error.message, queryResult)
    })
}
