const { createClient } = require('@clickhouse/client');
const sqlLimiter = require('sql-limiter');
const { formatSchemaQueryResults } = require('../utils');

const id = 'clickhouse';
const name = 'ClickHouse';

function getClickHouseSchemaSql(database) {
  const schemaSql = database ? `AND database = '${database}'` : '';
  return `
    SELECT 
      database as table_schema, 
      table as table_name, 
      name as column_name, 
      type as data_type 
    FROM 
      system.columns
    WHERE database NOT IN ('system')
    ${schemaSql}
    ORDER BY
      table_schema,
      table_name
  `;
}

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */
async function runQuery(query, connection) {
  let incomplete = false;
  let rows = [];

  const ONE_MILLION = 1000000;
  const maxRows = connection.maxRows || ONE_MILLION;
  const maxRowsPlusOne = maxRows + 1;

  let limitedQuery = sqlLimiter.limit(query, ['limit'], maxRowsPlusOne);

  const port = connection.port || 8123;
  const protocol = connection.useHTTPS ? 'https' : 'http';
  const host = `${protocol}://${connection.host}:${port}`;
  const database = connection.database;
  const username = connection.username || 'default';
  const password = connection.password || '';

  const client = createClient({
    host,
    database,
    username,
    password,
  });

  // clickhouse client needs to use exec or query depending on statement type
  // If the query returns some results, format needs to be set and the `query` method should be used
  // Otherwise `exec` method should be used
  const statementType = sqlLimiter.getStatementType(limitedQuery);

  const format =
    ['select', 'show', 'exists'].indexOf(statementType) > -1
      ? `JSONEachRow`
      : undefined;
  const useExec = !format;

  if (useExec) {
    await client.exec({ query: limitedQuery });
    return { rows, incomplete };
  }

  const resultSet = await client.query({ query: limitedQuery, format });
  rows = await resultSet.json();
  if (rows.length > maxRows) {
    incomplete = true;
    rows = rows.slice(0, maxRows);
  }
  return { rows, incomplete };
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = 'SELECT 1';
  return runQuery(query, connection);
}

/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection) {
  const schemaSql = getClickHouseSchemaSql(connection.database);
  return runQuery(schemaSql, connection).then((queryResult) =>
    formatSchemaQueryResults(queryResult)
  );
}

const fields = [
  {
    key: 'host',
    formType: 'TEXT',
    label: 'Host',
  },
  {
    key: 'port',
    formType: 'TEXT',
    label: 'HTTP Port (optional)',
  },
  {
    key: 'username',
    formType: 'TEXT',
    label: 'Username (optional)',
  },
  {
    key: 'password',
    formType: 'TEXT',
    label: 'Password (optional)',
  },
  {
    key: 'database',
    formType: 'TEXT',
    label: 'Database Name (optional)',
  },
  {
    key: 'useHTTPS',
    formType: 'CHECKBOX',
    label: 'Use HTTPS',
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
