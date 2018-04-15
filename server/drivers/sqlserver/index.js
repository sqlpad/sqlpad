const mssql = require('mssql')
const { formatSchemaQueryResults } = require('../utils')

const id = 'sqlserver'
const name = 'SQL Server'

const SCHEMA_SQL = `
  SELECT 
    t.table_schema, 
    t.table_name, 
    c.column_name, 
    c.data_type
  FROM 
    INFORMATION_SCHEMA.TABLES t 
    JOIN INFORMATION_SCHEMA.COLUMNS c ON t.table_schema = c.table_schema AND t.table_name = c.table_name 
  WHERE 
    t.table_schema NOT IN ('information_schema') 
  ORDER BY 
    t.table_schema, 
    t.table_name, 
    c.ordinal_position
`

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */
function runQuery(query, connection) {
  const config = {
    user: connection.username,
    password: connection.password,
    server: connection.host,
    port: connection.port ? connection.port : 1433,
    database: connection.database,
    domain: connection.domain,
    requestTimeout: 1000 * 60 * 60, // one hour
    options: {
      appName: 'SQLPad',
      encrypt: connection.sqlserverEncrypt
    },
    pool: {
      max: 1,
      min: 0,
      idleTimeoutMillis: 1000
    }
  }

  let incomplete
  const rows = []

  return new Promise((resolve, reject) => {
    const pool = new mssql.ConnectionPool(config, err => {
      if (err) {
        return reject(err)
      }

      const request = new mssql.Request(pool)
      // Stream set a config level doesn't seem to work
      request.stream = true
      request.query(query)

      request.on('row', row => {
        // special handling if columns were not given names
        if (row[''] && row[''].length) {
          for (let i = 0; i < row[''].length; i++) {
            row['UNNAMED COLUMN ' + (i + 1)] = row[''][i]
          }
          delete row['']
        }
        if (rows.length < connection.maxRows) {
          // if we haven't hit the max yet add row to results
          return rows.push(row)
        }
        if (!incomplete) {
          incomplete = true
          resolve({ rows, incomplete })
          request.cancel() // running this will yeild a cancel error
        }
      })

      // Error events may fire multiple times
      // If we get an ECANCEL error and too many rows were handled it was intentional
      request.on('error', err => {
        if (err.code === 'ECANCEL' && incomplete) {
          return
        }
        return reject(err)
      })

      // Always emitted as the last one
      request.on('done', () => {
        resolve({ rows, incomplete })
        pool.close()
      })
    })

    pool.on('error', err => reject(err))
  })
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = "SELECT 'success' AS TestQuery;"
  return runQuery(query, connection)
}

/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection) {
  return runQuery(SCHEMA_SQL, connection).then(queryResult =>
    formatSchemaQueryResults(queryResult)
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
  },
  {
    key: 'database',
    formType: 'TEXT',
    label: 'Database'
  },
  {
    key: 'username',
    formType: 'TEXT',
    label: 'Database Username'
  },
  {
    key: 'password',
    formType: 'PASSWORD',
    label: 'Database Password'
  },
  {
    key: 'domain',
    formType: 'TEXT',
    label: 'Domain'
  },
  {
    key: 'sqlserverEncrypt',
    formType: 'CHECKBOX',
    label: 'Encrypt (necessary for Azure)'
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
