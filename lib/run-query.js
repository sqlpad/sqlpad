var fs = require('fs')
var pg = require('pg')
var mysql = require('mysql')
var mssql = require('mssql')
var PgCursor = require('pg-cursor')
var vertica = require('vertica')
var crate = require('node-crate')
var presto = require('presto-client')
var config = require('./config.js')
var QueryResult = require('../models/QueryResult.js')

module.exports = function runQuery (query, connection, callback) {
  var queryResult = new QueryResult()
  queryResult.timerStart()
  clients[connection.driver](query, connection, queryResult, function (err, queryResult) {
    queryResult.timerStop()
    if (config.get('debug')) {
      var resultRowCount = (queryResult && queryResult.rows && queryResult.rows.length ? queryResult.rows.length : 0)
      console.log('\n--- lib/run-query.js ---')
      console.log('CONNECTION: ' + connection.name)
      console.log('START TIME: ' + queryResult.startTime.toISOString())
      console.log('END TIME: ' + queryResult.stopTime.toISOString())
      console.log('ELAPSED MS: ' + queryResult.queryRunTime)
      console.log('RESULT ROWS: ' + resultRowCount)
      console.log('QUERY: ')
      console.log(query)
      console.log()
    }
    callback(err, queryResult)
  })
}

var clients = {}

clients.mysql = function (query, connection, queryResult, callback) {
  var myConnection = mysql.createConnection({
    multipleStatements: true,
    host: connection.host,
    port: connection.port ? connection.port : 3306,
    user: connection.username,
    password: connection.password,
    database: connection.database,
    insecureAuth: connection.mysqlInsecureAuth
  })
  myConnection.connect(function (err) {
    if (err) return callback(err, queryResult)
    var rowCounter = 0
    var queryError
    var resultsSent = false
    function continueOn () {
      if (!resultsSent) {
        resultsSent = true
        callback(queryError, queryResult)
      }
    }
    var myQuery = myConnection.query(query)
    myQuery
      .on('error', function (err) {
        // Handle error,
        // an 'end' event will be emitted after this as well
        // so we'll call the callback there.
        queryError = err
      })
      .on('result', function (row) {
        rowCounter++
        if (rowCounter <= connection.maxRows) {
          // if we haven't hit the max yet add row to results
          queryResult.addRow(row)
        } else {
          // Too many rows! pause that connection.
          // It sounds like there is no way to close query stream
          // you just have to close the connection
          myConnection.pause()
          queryResult.incomplete = true
          continueOn() // return records to client before closing connection
          myConnection.end()
        }
      })
      .on('end', function () {
        // all rows have been received
        // This will not fire if we end the connection early
        continueOn()
        myConnection.end()
      })
  })
}

// TODO - crate driver should honor max rows restriction
clients.crate = function (query, connection, queryResult, callback) {
  var crateConfig = {
    host: connection.host
  }
  if (connection.port) {
    crate.connect(crateConfig.host, connection.port)
  } else {
    crate.connect(crateConfig.host)
  }
  query = query.replace(/;$/, '')
  crate.execute(query).success(function (res) {
    var results = {
      rows: [],
      fields: []
    }
    for (var row in res.rows) {
      results.rows[row] = {}
      for (var val in res.rows[row]) {
        var columnName = res.cols[val]
        var type = res.col_types[val]
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
  }).error(function (err) {
    callback(err.message, queryResult)
  })
}

clients.presto = function (query, connection, queryResult, callback) {
  var prestoConfig = {
    host: connection.host,
    port: connection.port,
    user: connection.username,
    catalog: connection.prestoCatalog,
    schema: connection.prestoSchema
  }
  var client = new presto.Client(prestoConfig)
  client.execute(query, function (err, data, columns) {
    if (err) {
      return callback(err.message, queryResult)
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
    callback(err, queryResult)
  })
}

clients.postgres = function (query, connection, queryResult, callback) {
  var pgConfig = {
    user: connection.username,
    password: connection.password,
    database: connection.database,
    host: connection.host,
    ssl: connection.postgresSsl
  }
  // TODO cache key/cert values
  if (connection.postgresKey && connection.postgresCert) {
    pgConfig.ssl = {
      key: fs.readFileSync(connection.postgresKey),
      cert: fs.readFileSync(connection.postgresCert)
    }
    if (connection.postgresCA) {
      pgConfig.ssl['ca'] = fs.readFileSync(connection.postgresCA)
    }
  }
  if (connection.port) pgConfig.port = connection.port

  var client = new pg.Client(pgConfig)
  client.connect(function (err) {
    if (err) {
      callback(err, queryResult)
      client.end()
    } else {
      var cursor = client.query(new PgCursor(query))
      cursor.read(connection.maxRows + 1, function (err, rows) {
        if (err) {
                    // pg_cursor can't handle multi-statements at the moment
                    // as a work around we'll retry the query the old way, but we lose the  maxRows protection
          client.query(query, function (err, result) {
            if (result && result.rows) queryResult.addRows(result.rows)
            callback(err, queryResult)
            client.end()
          })
        } else {
          queryResult.addRows(rows)
          if (rows.length === connection.maxRows + 1) {
            queryResult.incomplete = true
            queryResult.rows.pop() // get rid of that extra record. we only get 1 more than the max to see if there would have been more...
          }
          callback(err, queryResult)
          cursor.close(function (err) {
            if (err) {
              console.log('error closing pg-cursor:')
              console.log(err)
            }
            client.end()
          })
        }
      })
    }
  })
}

clients.sqlserver = function (query, connection, queryResult, callback) {
  var sqlconfig = {
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
  var mssqlConnection = new mssql.Connection(sqlconfig, function (err) {
    if (err) {
      callback(err, queryResult)
    } else {
      var rowCounter = 0
      var queryError
      var resultsSent = false
      var tooManyHandled = false

            // For SQL Server, this can be called more than once safely
      var continueOn = function () {
        if (!resultsSent) {
          resultsSent = true
          callback(queryError, queryResult)
        }
      }

      var request = new mssql.Request(mssqlConnection)
      request.query(query)

      request.on('row', function (row) {
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

      request.on('error', function (err) {
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

      request.on('done', function (returnValue) {
                // Always emitted as the last one
        continueOn()
        mssqlConnection.close() // I don't think this does anything using the tedious driver. but maybe someday it will
      })
    }
  })
}

clients.vertica = function (query, connection, queryResult, callback) {
  var params = {
    host: connection.host,
    port: connection.port ? connection.port : 5433,
    user: connection.username,
    password: connection.password,
    database: connection.database
  }
  var client = vertica.connect(params, function (err) {
    if (err) {
      callback(err, queryResult)
      client.disconnect()
    } else {
      var finished = false
      var rowCounter = 0
      var fields = []

      var verticaQuery = client.query(query)

      verticaQuery.on('fields', function (f) {
        for (var i in f) {
          if (f.hasOwnProperty(i)) {
            fields.push(f[i]['name'])
          }
        }
      })

      verticaQuery.on('row', function (row) {
        if (rowCounter < connection.maxRows) {
          var resultRow = {}
          for (var item in row) {
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

      verticaQuery.on('end', function () {
        if (!finished) {
          finished = true
          client.disconnect()
          callback(err, queryResult)
        }
      })

      verticaQuery.on('error', function (err) {
        if (!finished) {
          finished = true
          client.disconnect()
          callback(err, queryResult)
        }
      })
    }
  })
}
