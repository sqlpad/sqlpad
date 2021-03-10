const { ClickHouse } = require('clickhouse');
const sqlLimiter = require('sql-limiter');
const { formatSchemaQueryResults } = require('../utils');

// Important notes about clickhouse driver implementation:
//
// `clickhouse` package does not provide column information, and uses `request`
// May need to move to `node-clickhouse` or other library down the road
// https://clickhouse.tech/docs/en/interfaces/third-party/client-libraries/
//
// Row limiting is handled via sql-limiter. This works for `LIMIT <limit>` use,
// but could produce unexpected queries if user uses Clickhouse's `LIMIT <offset>,<limit>` syntax

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

  // NOTE - sql limiter may need to support ClickHouse's "LIMIT <offset>,<limit>" syntax
  // If a SQLPad users use that syntax, the sql-limiter will use the offset integer as limit integer.
  // This could potentially produce unexpected results
  const limitedQuery = sqlLimiter.limit(query, ['limit'], maxRowsPlusOne);

  const port = connection.port || 8123;
  const protocol = connection.useHTTPS ? 'https' : 'http';
  const url = `${protocol}://${connection.host}`;
  const database = connection.database;
  const basicAuth = {
    username: connection.username || 'default',
    password: connection.password || '',
  };

  const clickhouse = new ClickHouse({
    url,
    port,
    basicAuth,
    format: 'json',
    config: {
      database,
    },
  });

  rows = await clickhouse.query(limitedQuery).toPromise();
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
