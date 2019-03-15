const presto = require('./_presto');
const { formatSchemaQueryResults } = require('../utils');

const id = 'presto';
const name = 'Presto';

function getPrestoSchemaSql(catalog, schema) {
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
  const prestoConfig = {
    url: `http://${connection.host}:${port}`,
    user: connection.username,
    catalog: connection.prestoCatalog,
    schema: connection.prestoSchema
  };
  return presto.send(prestoConfig, query).then(result => {
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
  // Presto cannot have ; at end of query
  const query = "SELECT 'success' AS TestQuery";
  return runQuery(query, connection);
}

/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection) {
  const schemaSql = getPrestoSchemaSql(
    connection.prestoCatalog,
    connection.prestoSchema
  );
  return runQuery(schemaSql, connection).then(queryResult =>
    formatSchemaQueryResults(queryResult)
  );
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
    key: 'prestoCatalog',
    formType: 'TEXT',
    label: 'Catalog'
  },
  {
    key: 'prestoSchema',
    formType: 'TEXT',
    label: 'Schema'
  }
];

module.exports = {
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection
};
