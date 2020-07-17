const crate = require('node-crate');
const { formatSchemaQueryResults } = require('../utils');

const id = 'crate';
const name = 'Crate';

// NOTE per crate docs: If a client using the HTTP or Transport protocol is used a default limit of 10000 is implicitly added.
// node-crate uses the REST API, so it is assumed this is a limit
const CRATE_LIMIT = 10000;

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
`;

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
`;

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */
async function runQuery(query, connection) {
  const { maxRows } = connection;
  const limit = maxRows < CRATE_LIMIT ? maxRows : CRATE_LIMIT;

  let connectionString = getConnectionString(connection);
  crate.connect(connectionString);

  try {
    const res = await crate.execute(query);
    const results = {
      rows: res.json,
      incomplete: false,
    };
    if (results.rows.length >= limit) {
      results.incomplete = true;
      results.rows = results.rows.slice(0, limit);
    }
    return results;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Get connection string with options
 * @param {*} connection
 */
function getConnectionString(connection) {
  let url;
  try {
    // if connection.host contains a valid url e.g. 'https://crate.io:4200'
    url = new URL(connection.host);
    // if connection.host doesn't contain protocol e.g. 'crate.io:4200'
    if (!['http:', 'https:'].includes(url.protocol)) {
      let protocol = connection.ssl ? 'https:' : 'http:';
      url = new URL(protocol + connection.host);
    }
  } catch (error) {
    // if connection.host contains only hostname e.g. 'crate.io'
    let protocol = connection.ssl ? 'https:' : 'http:';
    url = new URL(protocol + connection.host);
  }
  if (connection.port) {
    url.port = connection.port;
  }
  if (connection.username) {
    url.username = connection.username;
    if (connection.password) {
      url.password = connection.password;
    }
  }
  return url.href;
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = 'SELECT name from sys.cluster';
  return runQuery(query, connection);
}

/**
 * Get schema for connection
 * NOTE: Crate DB v1's schema query is not compatible with v0's schema query
 * In the event v1 query does not work, try v0
 * If that errors out as well, then let that error bubble up
 * @param {*} connection
 */
async function getSchema(connection) {
  try {
    const queryResult = await runQuery(SCHEMA_SQL_V1, connection);
    return formatSchemaQueryResults(queryResult);
  } catch (error) {
    const queryResult = await runQuery(SCHEMA_SQL_V0, connection);
    return formatSchemaQueryResults(queryResult);
  }
}

const fields = [
  {
    key: 'host',
    formType: 'TEXT',
    label: 'Host/Server/IP Address',
  },
  {
    key: 'port',
    formType: 'TEXT',
    label: 'Port (optional)',
  },
  {
    key: 'username',
    formType: 'TEXT',
    label: 'Database Username',
  },
  {
    key: 'password',
    formType: 'PASSWORD',
    label: 'Database Password',
  },
  {
    key: 'ssl',
    formType: 'CHECKBOX',
    label: 'Use SSL',
  },
];

module.exports = {
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection,
};
