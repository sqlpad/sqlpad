const { options, connect } = require('td2.0-rest-connector');
const { formatSchemaQueryResults } = require('../utils');

const id = 'tdengine';
const name = 'TDengine';

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
    key: 'database',
    formType: 'TEXT',
    label: 'Database',
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
];

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */
async function runQuery(query, connection) {
  options.path = '/rest/sql/' + encodeURI(connection.database);
  options.host = connection.host;
  options.port = connection.port || options.port;
  options.user = connection.username || options.user;
  options.passwd = connection.password || options.passwd;

  const conn = connect(options);
  const cursor = conn.cursor();

  const queryResult = await cursor.query(query);

  let incomplete = false;

  if (queryResult.getStatus() === 'error') {
    throw new Error(queryResult.getErrStr());
  }

  const heads = queryResult.getHead();
  const results = queryResult.getData();

  let rows = results.map((result) => {
    const row = {};

    for (let index = 0; index < heads.length; index++) {
      row[heads[index]] = result[index];
    }

    return row;
  });

  const { maxRows } = connection;

  if (rows.length > maxRows) {
    rows = rows.slice(0, maxRows);
    incomplete = true;
  }

  return { rows, incomplete };
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = "SELECT 'success' AS `TestQuery` FROM log.log LIMIT 1;";

  return runQuery(query, connection);
}

/**
 * Get schema for connection
 * @param {*} connection
 */
async function getSchema(connection) {
  const stableQueryResult = await runQuery('SHOW STABLES;', connection);
  const tableQueryResult = await runQuery('SHOW TABLES;', connection);

  const tableRows = stableQueryResult.rows.concat(tableQueryResult.rows);

  const rows = [];

  for (const table of tableRows) {
    const table_name = table.table_name || table.name;
    const table_type = table.name ? 'STABLE' : 'TABLE';

    const columnQueryResult = await runQuery(
      `DESCRIBE ${table_name};`,
      connection
    );

    for (const column of columnQueryResult.rows) {
      rows.push({
        table_schema: connection.database,
        table_name,
        table_type,
        column_name: column.Field,
        data_type: column.Type + (column.Note === 'TAG' ? ' [TAG]' : ''),
      });
    }
  }

  return formatSchemaQueryResults({ rows });
}

module.exports = {
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection,
};
