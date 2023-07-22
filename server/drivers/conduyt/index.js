const conduyt = require('./_conduyt.js');
const { formatSchemaQueryResults } = require('../utils');

const id = 'conduyt';
const name = 'conduyt';

function getConduytSchemaSql(catalog, schema) {
  const schemaSql = schema ? `AND table_schema = '${schema}'` : '';
  return `
    SELECT 
      c.table_schema, 
      c.table_name, 
      c.column_name, 
      c.data_type
    FROM 
      ${catalog}.INFORMATION_SCHEMA.COLUMNS c
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
  const port = connection.port || 7782;
  const protocol = connection.useHTTPS ? 'https' : 'http';
  const config = {
    url: `${protocol}://${connection.host}:${port}`,
    user: connection.username,
    email: connection.useremail,
    catalog: connection.catalog,
    schema: connection.schema,
    sessionId: connection.sessionId,
  };
  return conduyt.send(config, query).then((result) => {
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
  const schemaSql = getConduytSchemaSql(connection.catalog, connection.schema);
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
    key: 'useremail',
    formType: 'TEXT',
    label: 'User Email',
  },
  {
    key: 'catalog',
    formType: 'TEXT',
    label: 'Catalog',
  },
  {
    key: 'sessionId',
    formType: 'TEXT',
    label: 'Session Id',
  },  
  {
    key: 'schema',
    formType: 'TEXT',
    label: 'Schema',
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
