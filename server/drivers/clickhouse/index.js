// `clickhouse` package does not provide column information, and uses `request`
// May need to move to `node-clickhouse` or other library down the road
// https://clickhouse.tech/docs/en/interfaces/third-party/client-libraries/
const { ClickHouse } = require('clickhouse');
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

  // clickhouse package will append ' FORMAT JSON' to certain queries,
  // but does not handle CTEs WITH... SELECT.
  // This is a modified approach used in package:
  // https://github.com/TimonKK/clickhouse/blob/9dea3c0c3e4f3e2fe64e59dad762f1db044bf9bf/index.js#L479
  // If a certain query type is detected and FORMAT JSON is not included, append it
  // CTEs will be detected as following statement type (WITH cte AS (...) SELECT) will have type of "select"
  const statementType = sqlLimiter.getStatementType(limitedQuery);
  if (
    ['select', 'show', 'exists'].indexOf(statementType) > -1 &&
    !limitedQuery
      .trim()
      .match(/FORMAT\s*(JSON|TabSeparatedWithNames|CSVWithNames)/im)
  ) {
    limitedQuery += ' FORMAT JSON';
  }

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
