const mssql = require('mssql')

function getSchemaSql() {
  return `
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
}

function runQuery(query, connection, queryResult, callback) {
  const sqlconfig = {
    user: connection.username,
    password: connection.password,
    server: connection.host,
    port: connection.port ? connection.port : 1433,
    database: connection.database,
    domain: connection.domain,
    stream: true,
    requestTimeout: 1000 * 60 * 60, // one hour
    options: {
      encrypt: connection.sqlserverEncrypt
    }
  }
  const mssqlConnection = new mssql.Connection(sqlconfig, function(err) {
    if (err) {
      callback(err, queryResult)
    } else {
      let rowCounter = 0
      let queryError
      let resultsSent = false
      let tooManyHandled = false

      // For SQL Server, this can be called more than once safely
      const continueOn = function() {
        if (!resultsSent) {
          resultsSent = true
          callback(queryError, queryResult)
        }
      }

      var request = new mssql.Request(mssqlConnection)
      request.query(query)

      request.on('row', function(row) {
        // special handling if columns were not given names
        if (row[''] && row[''].length) {
          for (var i = 0; i < row[''].length; i++) {
            row['UNNAMED COLUMN ' + (i + 1)] = row[''][i]
          }
          delete row['']
        }
        rowCounter++
        if (rowCounter <= connection.maxRows) {
          // if we haven't hit the max yet add row to results
          queryResult.addRow(row)
        } else {
          if (!tooManyHandled) {
            tooManyHandled = true
            // Too many rows!
            queryResult.incomplete = true
            continueOn()
            console.log('Row limit hit - Attempting to cancel query...')
            request.cancel() // running this will yeild a cancel error
          }
        }
      })

      request.on('error', function(err) {
        // May be emitted multiple times
        // for now I guess we just set queryError to be the most recent error?
        if (err.code === 'ECANCEL') {
          console.log('Query cancelled successfully')
        } else {
          console.log('mssql query error:')
          console.log(err)
          queryError = err
        }
      })

      request.on('done', function(returnValue) {
        // Always emitted as the last one
        continueOn()
        mssqlConnection.close() // I don't think this does anything using the tedious driver. but maybe someday it will
      })
    }
  })
}

module.exports = {
  getSchemaSql,
  runQuery
}
