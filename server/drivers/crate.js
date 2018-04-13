const crate = require('node-crate')
const QueryResult = require('../models/QueryResult')
const { formatSchemaQueryResults } = require('./utils')

const id = 'crate'
const name = 'Crate'

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
function runQuery(query, connection) {
  const queryResult = new QueryResult()
  return new Promise((resolve, reject) => {
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
        return resolve(queryResult)
      })
      .error(err => reject(err.message))
  })
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = 'SELECT name from sys.cluster'
  return runQuery(query, connection)
}

/**
 * Get schema for connection
 * NOTE: Crate DB v1's schema query is not compatible with v0's schema query
 * In the event v1 query does not work, try v0
 * If that errors out as well, then let that error bubble up
 * @param {*} connection
 */
function getSchema(connection) {
  return runQuery(SCHEMA_SQL_V1, connection)
    .then(queryResult => formatSchemaQueryResults(queryResult))
    .catch(error =>
      runQuery(SCHEMA_SQL_V0, connection).then(queryResult =>
        formatSchemaQueryResults(queryResult)
      )
    )
}

const fields = [
  {
    key: 'host',
    formType: 'TEXT',
    label: 'Host/Server/IP Address'
  },
  {
    key: 'port',
    formType: 'TEXT',
    label: 'Port (optional)'
  }
]

module.exports = {
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection
}
