const runQuery = require('./run-query.js')
const _ = require('lodash')
const decipher = require('./decipher.js')
const crateDriver = require('../drivers/crate')
const postgresDriver = require('../drivers/pg')
const verticaDriver = require('../drivers/vertica')
const prestoDriver = require('../drivers/presto')
const hanaDriver = require('../drivers/hdb')
const mysqlDriver = require('../drivers/mysql')
const mssqlDriver = require('../drivers/mssql')

function getPrimarySql(connection) {
  if (connection.driver === 'vertica') {
    return verticaDriver.SCHEMA_SQL
  } else if (connection.driver === 'crate') {
    return crateDriver.SCHEMA_SQL_V1
  } else if (connection.driver === 'presto') {
    return prestoDriver.getPrestoSchemaSql(
      connection.prestoCatalog,
      connection.prestoSchema
    )
  } else if (connection.driver === 'postgres') {
    return postgresDriver.SCHEMA_SQL
  } else if (connection.driver === 'hdb') {
    return hanaDriver.getHANASchemaSql(connection.hanaSchema)
  } else if (connection.driver === 'mysql') {
    return mysqlDriver.getSchemaSql(connection.database)
  } else if (connection.driver === 'sqlserver') {
    return mssqlDriver.getSchemaSql()
  }
}

function getSecondarySql(connection) {
  if (connection.driver === 'crate') {
    return crateDriver.SCHEMA_SQL_V0
  }
}

function getSchemaForConnection(connection, doneCallback) {
  connection.username = decipher(connection.username)
  connection.password = decipher(connection.password)
  connection.maxRows =
    typeof Number.MAX_SAFE_INTEGER === 'undefined'
      ? 9007199254740991
      : Number.MAX_SAFE_INTEGER

  const primarySchemaSql = getPrimarySql(connection)

  runQuery(primarySchemaSql, connection, function(err, queryResult) {
    const secondarySchemaSql = getSecondarySql(connection)
    if (err && !secondarySchemaSql) {
      console.error(err)
      return doneCallback(err)
    }
    if (err && secondarySchemaSql) {
      return runQuery(secondarySchemaSql, connection, function(
        err,
        queryResult
      ) {
        if (err) {
          return doneCallback(err)
        }
        return formatResults(queryResult, doneCallback)
      })
    }
    return formatResults(queryResult, doneCallback)
  })
}

function formatResults(queryResult, doneCallback) {
  if (!queryResult || !queryResult.rows || !queryResult.rows.length) {
    return doneCallback(null, {})
  }

  // queryResult row casing may not always be consistent with what is specified in query
  // HANA is always uppercase despire aliasing as lower case for example
  // To account for this loop through rows and normalize the case
  const rows = queryResult.rows.map(row => {
    const cleanRow = {}
    Object.keys(row).forEach(key => {
      cleanRow[key.toLowerCase()] = row[key]
    })
    return cleanRow
  })

  const tree = {}
  const bySchema = _.groupBy(rows, 'table_schema')
  for (const schema in bySchema) {
    if (bySchema.hasOwnProperty(schema)) {
      tree[schema] = {}
      const byTableName = _.groupBy(bySchema[schema], 'table_name')
      for (const tableName in byTableName) {
        if (byTableName.hasOwnProperty(tableName)) {
          tree[schema][tableName] = byTableName[tableName]
        }
      }
    }
  }
  /*
  At this point, tree should look like this:
    {
      "schema-name": {
        "table-name": [
          {
            column_name: "the column name",
            data_type: "string"
          }
        ]
      }
    }
  */
  return doneCallback(null, tree)
}

module.exports = getSchemaForConnection
