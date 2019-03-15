const odbc = require('odbc')();
const { formatSchemaQueryResults } = require('../utils');

const id = 'unixodbc';
const name = 'unixODBC';

// Default to using INFORMATION_SCHEMA with old-style join for maximum compatibility
// INFORMATION_SCHEMA is not supported by every DBMS but it is supported by
// enough to be a good default (in the absence of ODBC meta data access).
// As of 2018-05-15 https://github.com/wankdanker/node-odbc does not offer a schema interface.

const SCHEMA_SQL_INFORMATION_SCHEMA = `
  SELECT
      c.table_schema as table_schema,
      c.table_name as table_name,
      c.column_name as column_name,
      c.data_type as data_type
  FROM
      INFORMATION_SCHEMA.columns c
  WHERE
      c.table_schema NOT IN ('INFORMATION_SCHEMA', 'information_schema')
  ORDER BY
    c.table_schema,
    c.table_name,
    c.ordinal_position
`;

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */

function runQuery(query, connection) {
  const config = {
    user: connection.username,
    password: connection.password,
    connection_string: connection.connection_string
  };
  // TODO use connection pool
  // TODO handle connection.maxRows

  let cn = config.connection_string;

  // Not all drivers require auth
  if (config.user) {
    cn = cn + ';Uid=' + config.user;
  }
  if (config.password) {
    cn = cn + ';Pwd=' + config.password;
  }

  return openConnection(cn)
    .then(() => executeQuery(query))
    .then(queryResult => {
      odbc.close(); // TODO consider putting into finally()?
      return Promise.resolve({ rows: queryResult, incomplete: false });
    })
    .catch(function(e) {
      console.error(e, e.stack);
    });
}

function executeQuery(sqlString) {
  return new Promise((resolve, reject) => {
    odbc.query(sqlString, function(err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

function openConnection(connectionString) {
  return new Promise((resolve, reject) => {
    odbc.open(connectionString, function(err) {
      if (err) {
        reject(err);
      }
      resolve('Connection Open');
    });
  });
}

/**
 * Test connectivity of connection
 * @param {*} connection
 */
function testConnection(connection) {
  const query = "SELECT 'success' AS TestQuery;";
  return runQuery(query, connection);
}

// TODO - reviewed no change needed? datatypes need reviewing
/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection) {
  const schema_sql = connection.schema_sql
    ? connection.schema_sql
    : SCHEMA_SQL_INFORMATION_SCHEMA;
  return runQuery(schema_sql, connection).then(queryResult =>
    formatSchemaQueryResults(queryResult)
  );
}

const fields = [
  {
    key: 'connection_string',
    formType: 'TEXT',
    label:
      'ODBC connection string. Examples:\ndsn=NAME\nDriver={SQLite3};Database=/tmp/my.db\n"Driver={Ingres};Server=VNODE;Database=mydb"'
  },
  {
    key: 'schema_sql',
    formType: 'TEXT',
    label:
      'Database sql to lookup schema (optional, if ommited default to checking INFORMATION_SCHEMA)'
  },
  {
    key: 'username',
    formType: 'TEXT',
    label: 'Database Username (optional)'
  },
  {
    key: 'password',
    formType: 'PASSWORD',
    label: 'Database Password (optional)'
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
