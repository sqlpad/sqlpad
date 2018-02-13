const presto = require('./_presto')

function getPrestoSchemaSql(catalog, schema) {
  const schemaSql = schema ? `AND table_schema = '${schema}'` : ''
  return `
    SELECT 
      c.table_schema, 
      c.table_name, 
      c.column_name, 
      c.data_type
    FROM 
      INFORMATION_SCHEMA.COLUMNS c
    WHERE
      table_catalog = '${catalog}'
      ${schemaSql}
    ORDER BY 
      c.table_schema, 
      c.table_name, 
      c.ordinal_position
  `
}

function runQuery(query, connection, queryResult, callback) {
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

module.exports = {
  getPrestoSchemaSql,
  runQuery
}
