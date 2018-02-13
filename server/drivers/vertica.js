const vertica = require('vertica')

const SCHEMA_SQL = `
  SELECT 
    vt.table_schema, 
    vt.table_name, 
    vc.column_name, 
    vc.data_type
  FROM 
    V_CATALOG.TABLES vt 
    JOIN V_CATALOG.ALL_TABLES vat ON vt.table_id = vat.table_id 
    JOIN V_CATALOG.COLUMNS vc ON vt.table_schema = vc.table_schema AND vt.table_name = vc.table_name 
  WHERE 
    vt.table_schema NOT IN ('V_CATALOG') AND vat.table_type = 'TABLE' 
  ORDER BY 
    vt.table_schema, 
    vt.table_name, 
    vc.ordinal_position
`

function runQuery(query, connection, queryResult, callback) {
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

module.exports = {
  runQuery,
  SCHEMA_SQL
}
