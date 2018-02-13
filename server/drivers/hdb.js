const hdb = require('hdb')

function getHANASchemaSql(schema) {
  const whereSql = schema ? `WHERE tables.SCHEMA_NAME = '${schema}'` : ''
  return `
    SELECT 
      columns.SCHEMA_NAME as table_schema, 
      columns.TABLE_NAME as table_name, 
      columns.COLUMN_NAME as column_name, 
      columns.DATA_TYPE_NAME as data_type
    FROM 
      SYS.TABLES tables
      JOIN SYS.COLUMNS columns ON tables.SCHEMA_NAME = columns.SCHEMA_NAME AND tables.TABLE_NAME = columns.TABLE_NAME
    ${whereSql}
    ORDER BY 
     columns.POSITION
  `
}

function runQuery(query, connection, queryResult, callback) {
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

module.exports = {
  getHANASchemaSql,
  runQuery
}
