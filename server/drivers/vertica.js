const vertica = require('vertica')
const { formatSchemaQueryResults } = require('./utils')

const id = 'vertica'
const name = 'Vertica'

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

function runQuery(query, connection) {
  const params = {
    host: connection.host,
    port: connection.port ? connection.port : 5433,
    user: connection.username,
    password: connection.password,
    database: connection.database
  }

  let incomplete = false
  const rows = []

  return new Promise((resolve, reject) => {
    const client = vertica.connect(params, function(err) {
      if (err) {
        client.disconnect()
        return reject(err)
      }
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
          rows.push(resultRow)
          rowCounter++
        } else {
          if (!finished) {
            finished = true
            client.disconnect()
            incomplete = true
            return resolve({ rows, incomplete })
          }
        }
      })

      verticaQuery.on('end', function() {
        if (!finished) {
          finished = true
          client.disconnect()
          return resolve({ rows, incomplete })
        }
      })

      verticaQuery.on('error', function(err) {
        if (!finished) {
          finished = true
          client.disconnect()
          return reject(err)
        }
      })
    })
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
