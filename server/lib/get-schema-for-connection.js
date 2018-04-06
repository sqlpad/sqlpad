const _ = require('lodash')
const { runQuery } = require('../drivers/index')
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

function formatResults(queryResult) {
  if (!queryResult || !queryResult.rows || !queryResult.rows.length) {
    return {}
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
  return tree
}

/**
 * Gets schema for connection
 * @param {*} connection
 * @returns {Promise}
 */
function getSchemaForConnection(connection) {
  connection.username = decipher(connection.username)
  connection.password = decipher(connection.password)
  connection.maxRows = Number.MAX_SAFE_INTEGER

  const primarySchemaSql = getPrimarySql(connection)

  return runQuery(primarySchemaSql, connection)
    .then(queryResult => formatResults(queryResult))
    .catch(error => {
      const secondarySchemaSql = getSecondarySql(connection)
      if (!secondarySchemaSql) {
        console.error(error)
        throw error
      }
      return runQuery(secondarySchemaSql, connection).then(queryResult =>
        formatResults(queryResult)
      )
    })
}

module.exports = getSchemaForConnection
