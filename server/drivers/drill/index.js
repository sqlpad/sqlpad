/*
Copyright 2017 Charles S. Givre

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const drill = require('./drill.js')
const { formatSchemaQueryResults } = require('../utils')

const id = 'drill'
const name = 'Apache Drill'

function getDrillSchemaSql(catalog, schema) {
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

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */

function runQuery(query, connection) {
  let incomplete = false
  const rows = []
  const port = connection.port || 8047

  const drillConfig = {
    host: connection.host,
    port: connection.port,
    user: connection.username,
    password: connection.password,
    defaultSchema: connection.drillDefaultSchema,
    ssl: connection.ssl || false
  }
  const client = new drill.Client(drillConfig)

  //return client.query(query, function(error, data, columns) {
  return client.query(drillConfig, query).then(result => {
    if (!result) {
      throw new Error('No result returned')
    } else if (result.errorMessage && result.errorMessage.length > 0) {
      console.log('Error with query: ' + query)
      console.log(result.errorMessage)
      throw new Error(result.errorMessage.split('\n')[0])
    }
    if (result.length > connection.maxRows) {
      incomplete = true
      result['rows'] = result['rows'].slice(0, connection.maxRows)
    }
    for (let r = 0; r < result['rows'].length; r++) {
      const row = {}
      for (let c = 0; c < result['columns'].length; c++) {
        row[result['columns'][c]] = result['rows'][r][result['columns'][c]]
      }
      rows.push(row)
    }
    return { rows, incomplete }
  })
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = "SELECT 'success'  FROM (VALUES(1))"
  return runQuery(query, connection)
}

/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection) {
  const schemaSql = getDrillSchemaSql(
    connection.drillCatalog
    //connection.drillSchema
  )
  return runQuery(schemaSql, connection).then(queryResult =>
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
    key: 'drillDefaultSchema',
    formType: 'TEXT',
    label: 'Default Schema'
  },
  {
    key: 'ssl',
    formType: 'CHECKBOX',
    label: 'Use SSL to connect to Drill'
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
