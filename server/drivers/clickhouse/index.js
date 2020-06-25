const clickhouse = require('./_clickhouse');
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
function runQuery(query, connection) {
  let incomplete = false;
  const rows = [];
  const port = connection.port || 8123;
  const clickhouseConfig = {
    url: `http://${connection.host}:${port}`,
    user: connection.username || 'default',
    password: connection.password || '',
    database: connection.database || 'default',
  };
  query = `${query} FORMAT JSON`;
  return clickhouse.send(clickhouseConfig, query).then((result) => {
    if (!result) {
      throw new Error('No result returned');
    }
    let { data, columns } = result;
    if (data.length > connection.maxRows) {
      incomplete = true;
      data = data.slice(0, connection.maxRows);
    }
    for (let r = 0; r < data.length; r++) {
      const row = {};
      for (let c = 0; c < columns.length; c++) {
        // row[columns[c].name] = data[r][c];
        row[columns[c].name] = data[r][columns[c].name];
      }
      rows.push(row);
    }
    return { rows, incomplete };
  });
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
];

module.exports = {
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection,
};
