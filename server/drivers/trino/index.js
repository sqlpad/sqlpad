const trino = require('./_trino');
const { formatSchemaQueryResults } = require('../utils');

const id = 'trino';
const name = 'Trino';

function getTrinoSchemaSql(catalog, schema) {
  const schemaSql = schema ? `AND table_schema = '${schema}'` : '';
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
  const port = connection.port || 8080;
  const config = {
    url: `http://${connection.host}:${port}`,
    user: connection.username,
    catalog: connection.catalog,
    schema: connection.schema,
  };
  return trino.send(config, query).then((result) => {
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
        row[columns[c].name] = data[r][c];
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
  const query = "SELECT 'success' AS TestQuery";
  return runQuery(query, connection);
}

/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection) {
  const schemaSql = getTrinoSchemaSql(connection.catalog, connection.schema);
  return runQuery(schemaSql, connection).then((queryResult) =>
    formatSchemaQueryResults(queryResult)
  );
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
    key: 'catalog',
    formType: 'TEXT',
    label: 'Catalog',
  },
  {
    key: 'schema',
    formType: 'TEXT',
    label: 'Schema',
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
