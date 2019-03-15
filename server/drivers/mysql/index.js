const mysql = require('mysql');
const { formatSchemaQueryResults } = require('../utils');

const id = 'mysql';
const name = 'MySQL';

function getSchemaSql(database) {
  const whereSql = database
    ? `WHERE t.table_schema = '${database}'`
    : `WHERE t.table_schema NOT IN (
        'mysql', 
        'performance_schema', 
        'information_schema'
      )`;
  return `
    SELECT 
      t.table_schema, 
      t.table_name, 
      c.column_name, 
      c.data_type
    FROM 
      INFORMATION_SCHEMA.TABLES t 
      JOIN INFORMATION_SCHEMA.COLUMNS c ON t.table_schema = c.table_schema AND t.table_name = c.table_name 
    ${whereSql}
    ORDER BY 
      t.table_schema, 
      t.table_name, 
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
  const myConnection = mysql.createConnection({
    multipleStatements: true,
    host: connection.host,
    port: connection.port ? connection.port : 3306,
    user: connection.username,
    password: connection.password,
    database: connection.database,
    insecureAuth: connection.mysqlInsecureAuth,
    timezone: 'Z',
    supportBigNumbers: true
  });

  return new Promise((resolve, reject) => {
    let incomplete = false;
    const rows = [];

    myConnection.connect(err => {
      if (err) {
        return reject(err);
      }
      let queryError;
      let resultsSent = false;

      function continueOn() {
        if (!resultsSent) {
          resultsSent = true;
          if (queryError) {
            return reject(queryError);
          }
          return resolve({ rows, incomplete });
        }
      }

      const myQuery = myConnection.query(query);
      myQuery
        .on('error', function(err) {
          // Handle error,
          // an 'end' event will be emitted after this as well
          // so we'll call the callback there.
          queryError = err;
        })
        .on('result', function(row) {
          // If we haven't hit the max yet add row to results
          if (rows.length < connection.maxRows) {
            return rows.push(row);
          }

          // Too many rows
          incomplete = true;

          // Stop the query stream
          myConnection.pause();

          // Destroy the underlying connection
          // Calling end() will wait and eventually time out
          myConnection.destroy();
          continueOn();
        })
        .on('end', function() {
          // all rows have been received
          // This will not fire if we end the connection early
          // myConnection.end()
          // myConnection.destroy()
          myConnection.end(error => {
            if (error) {
              console.error('Error ending MySQL connection', error);
            }
            continueOn();
          });
        });
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

/**
 * Get schema for connection
 * @param {*} connection
 */
function getSchema(connection) {
  const schemaSql = getSchemaSql(connection.database);
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
    key: 'database',
    formType: 'TEXT',
    label: 'Database'
  },
  {
    key: 'username',
    formType: 'TEXT',
    label: 'Database Username'
  },
  {
    key: 'password',
    formType: 'PASSWORD',
    label: 'Database Password'
  },
  {
    key: 'mysqlInsecureAuth',
    formType: 'CHECKBOX',
    label: 'Use old/insecure pre 4.1 Auth System'
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
