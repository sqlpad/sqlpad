const crate = require('node-crate')

// old crate called table_schema schema_name
const SCHEMA_SQL_V0 = `
  select 
    tables.schema_name as table_schema, 
    tables.table_name as table_name, 
    column_name, 
    data_type 
  from 
    information_schema.tables, information_schema.columns 
  where  
    tables.schema_name not in ('information_schema') 
    and columns.schema_name = tables.schema_name 
    and columns.table_name = tables.table_name
`

const SCHEMA_SQL_V1 = `
  select 
    tables.table_schema as table_schema, 
    tables.table_name as table_name, 
    column_name, 
    data_type 
  from 
    information_schema.tables, information_schema.columns 
  where  
    tables.table_schema not in ('information_schema') 
    and columns.table_schema = tables.table_schema 
    and columns.table_name = tables.table_name
`

// TODO - crate driver should honor max rows restriction
function runQuery(query, connection, queryResult, callback) {
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

function getSchemaForConnection(connection, doneCallback) {
  // TODO
}

module.exports = {
  getSchemaForConnection,
  runQuery,
  SCHEMA_SQL_V0,
  SCHEMA_SQL_V1
}
