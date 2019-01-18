const crate = require('node-crate')
const { formatSchemaQueryResults } = require('../utils')

const id = 'crate'
const name = 'Crate'

// NOTE per crate docs: If a client using the HTTP or Transport protocol is used a default limit of 10000 is implicitly added.
// node-crate uses the REST API, so it is assumed this is a limit
const CRATE_LIMIT = 10000

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

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */
function runQuery(query, connection) {
  const { maxRows } = connection
  const limit = maxRows < CRATE_LIMIT ? maxRows : CRATE_LIMIT

  if (connection.port) {
    crate.connect(
      connection.host,
      connection.port
    )
  } else {
    crate.connect(connection.host)
  }

  return crate
    .execute(query)
    .then(res => {
      const results = {
        rows: res.json,
        incomplete: false
      }

      if (results.rows.length >= limit) {
        results.incomplete = true
        results.rows = results.rows.slice(0, limit)
      }

      return results
    })
    .catch(err => {
      throw new Error(err.message)
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
