const crate = require('node-crate')

// TODO - crate driver should honor max rows restriction
exports.runQuery = function(query, connection, queryResult, callback) {
  const crateConfig = {
    host: connection.host
  }
  if (connection.port) {
    crate.connect(crateConfig.host, connection.port)
  } else {
    crate.connect(crateConfig.host)
  }
  query = query.replace(/;$/, '')
  crate
    .execute(query)
    .success(function(res) {
      const results = {
        rows: [],
        fields: []
      }
      for (const row in res.rows) {
        results.rows[row] = {}
        for (let val in res.rows[row]) {
          const columnName = res.cols[val]
          const type = res.col_types[val]
          val = res.rows[row][val]
          if (type === 11) {
            val = new Date(val)
          }
          results.rows[row][columnName] = val
          results.fields[row] = columnName
        }
      }
      queryResult.addRows(results.rows)
      callback(null, queryResult)
    })
    .error(function(err) {
      callback(err.message, queryResult)
    })
}
