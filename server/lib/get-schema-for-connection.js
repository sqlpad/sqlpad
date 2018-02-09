const runQuery = require('./run-query.js')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const decipher = require('./decipher.js')

const sqldir = path.join(__dirname, '/../resources/')

const sqlSchemaPostgres = fs.readFileSync(sqldir + '/schema-postgres.sql', {
  encoding: 'utf8'
})
const sqlSchemaVertica = fs.readFileSync(sqldir + '/schema-vertica.sql', {
  encoding: 'utf8'
})
const sqlSchemaCrate = fs.readFileSync(sqldir + '/schema-crate.sql', {
  encoding: 'utf8'
})
const sqlSchemaCrateV0 = fs.readFileSync(sqldir + '/schema-crate.v0.sql', {
  encoding: 'utf8'
})

// TODO - eventually replace these functions with something driver methods
// What I'm thinking is each db driver will have a set of api functions implemented
// They would be like driver.runQuery() and driver.getSchema()
// For now this restructuring is a help to break this out of the route logic

function getStandardSchemaSql(whereSql = '') {
  return `
    SELECT 
      t.table_schema, 
      t.table_name, 
      c.column_name, 
      c.data_type
    FROM 
      INFORMATION_SCHEMA.TABLES t 
      JOIN INFORMATION_SCHEMA.COLUMNS c ON t.table_schema = c.table_schema AND t.table_name = c.table_name 
    ${whereSql}
    ORDER BY 
      t.table_schema, 
      t.table_name, 
      c.ordinal_position
  `
}

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

function getHANASchemaSql(whereSql = '') {
  return `
    SELECT 
      columns.SCHEMA_NAME as table_schema, 
      columns.TABLE_NAME as table_name, 
      columns.COLUMN_NAME as column_name, 
      columns.DATA_TYPE_NAME as data_type
    FROM 
      SYS.TABLES tables
      JOIN SYS.COLUMNS columns ON tables.SCHEMA_NAME = columns.SCHEMA_NAME AND tables.TABLE_NAME = columns.TABLE_NAME
    ${whereSql}
    ORDER BY 
     columns.POSITION
  `
}

function getPrimarySql(connection) {
  if (connection.driver === 'vertica') {
    return sqlSchemaVertica
  } else if (connection.driver === 'crate') {
    return sqlSchemaCrate
  } else if (connection.driver === 'presto') {
    return getPrestoSchemaSql(connection.prestoCatalog, connection.prestoSchema)
  } else if (connection.driver === 'postgres') {
    return sqlSchemaPostgres
  } else if (connection.driver === 'hdb') {
    if (connection.database) {
      if (connection.hanaSchema) {
        return getHANASchemaSql(
          `WHERE tables.SCHEMA_NAME = '${connection.hanaSchema}'`
        )
      } else {
        return getHANASchemaSql()
      }
    }
  } else if (connection.driver === 'mysql') {
    if (connection.database) {
      return getStandardSchemaSql(
        `WHERE t.table_schema = '${connection.database}'`
      )
    }
    return getStandardSchemaSql(
      `WHERE t.table_schema NOT IN ('mysql', 'performance_schema', 'information_schema')`
    )
  } else {
    return getStandardSchemaSql(
      `WHERE t.table_schema NOT IN ('information_schema') `
    )
  }
}

function getSecondarySql(connection) {
  if (connection.driver === 'crate') {
    return sqlSchemaCrateV0
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
    if (connection.driver === 'hdb') {
      return formatHANAResults(queryResult, doneCallback)
    } else {
      return formatResults(queryResult, doneCallback)
    }
  })
}

function formatResults(queryResult, doneCallback) {
  const tree = {}
  const bySchema = _.groupBy(queryResult.rows, 'table_schema')
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

function formatHANAResults(queryResult, doneCallback) {
  //console.log(queryResult.rows)
  const tree = {}
  const bySchema = _.groupBy(queryResult.rows, 'TABLE_SCHEMA')
  //console.log(bySchema)
  for (const schema in bySchema) {
    if (bySchema.hasOwnProperty(schema)) {
      tree[schema] = {}
      const byTableName = _.groupBy(bySchema[schema], 'TABLE_NAME')
      for (const tableName in byTableName) {
        if (byTableName.hasOwnProperty(tableName)) {
          tree[schema][tableName] = byTableName[tableName]
        }
      }
    }
  }
  return doneCallback(null, tree)
}

module.exports = getSchemaForConnection
