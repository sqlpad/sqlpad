'use strict'
const runQuery = require('./run-query.js')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const decipher = require('./decipher.js')

const sqldir = path.join(__dirname, '/../resources/')

const sqlSchemaPostgres = fs.readFileSync(sqldir + '/schema-postgres.sql', {encoding: 'utf8'})
const sqlSchemaVertica = fs.readFileSync(sqldir + '/schema-vertica.sql', {encoding: 'utf8'})
const sqlSchemaCrate = fs.readFileSync(sqldir + '/schema-crate.sql', {encoding: 'utf8'})
const sqlSchemaCrateV0 = fs.readFileSync(sqldir + '/schema-crate.v0.sql', {encoding: 'utf8'})

// TODO - eventually replace these functions with something driver methods
// What I'm thinking is each db driver will have a set of api functions implemented
// They would be like driver.runQuery() and driver.getSchema()
// For now this restructuring is a help to break this out of the route logic

function getStandardSchemaSql (whereSql = '') {
  return `
    SELECT 
      (CASE t.table_type WHEN 'BASE TABLE' THEN 'Tables' WHEN 'VIEW' THEN 'Views' ELSE t.table_type END) AS table_type, 
      t.table_schema, 
      t.table_name, 
      c.column_name, 
      c.data_type, 
      c.is_nullable 
    FROM 
      INFORMATION_SCHEMA.tables t 
      JOIN INFORMATION_SCHEMA.columns c ON t.table_schema = c.table_schema AND t.table_name = c.table_name 
    ${whereSql}
    ORDER BY 
      t.table_type, 
      t.table_schema, 
      t.table_name, 
      c.ordinal_position
  `
}

function getPrimarySql (connection) {
  if (connection.driver === 'vertica') {
    return sqlSchemaVertica
  } else if (connection.driver === 'crate') {
    return sqlSchemaCrate
  } else if (connection.driver === 'postgres') {
    return sqlSchemaPostgres
  } else if (connection.driver === 'mysql') {
    return getStandardSchemaSql(`WHERE t.table_schema NOT IN ('mysql', 'performance_schema', 'information_schema') `)
  } else {
    return getStandardSchemaSql(`WHERE t.table_schema NOT IN ('information_schema') `)
  }
}

function getSecondarySql (connection) {
  if (connection.driver === 'crate') {
    return sqlSchemaCrateV0
  }
}

function getSchemaForConnection (connection, doneCallback) {
  connection.username = decipher(connection.username)
  connection.password = decipher(connection.password)
  connection.maxRows = typeof Number.MAX_SAFE_INTEGER === 'undefined' ? 9007199254740991 : Number.MAX_SAFE_INTEGER

  const primarySchemaSql = getPrimarySql(connection)

  runQuery(primarySchemaSql, connection, function (err, queryResult) {
    const secondarySchemaSql = getSecondarySql(connection)
    if (err && !secondarySchemaSql) {
      console.error(err)
      return doneCallback(err)
    }
    if (err && secondarySchemaSql) {
      return runQuery(secondarySchemaSql, connection, function (err, queryResult) {
        if (err) {
          return doneCallback(err)
        }
        return formatResults(queryResult, doneCallback)
      })
    }
    return formatResults(queryResult, doneCallback)
  })
}

function formatResults (queryResult, doneCallback) {
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
  // TODO get rid of is_nullable since no plans on using it in UI
  /*
  At this point, tree should look like this:
    {
      "schama-name": {
        "table-name": [
          {
            column_name: "the column name",
            data_type: "string",
            is_nullable: "no"
          }
        ]
      }
    }
  */
  return doneCallback(null, tree)
}

module.exports = getSchemaForConnection
