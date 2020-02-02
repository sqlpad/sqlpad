const snowflake = require('snowflake-sdk');
const { formatSchemaQueryResults } = require('../utils');

const id = 'snowflake';
const name = 'Snowflake';

function getSchemaSql(schema) {
  const whereSql = schema
    ? `WHERE t.table_schema = UPPER('${schema}')`
    : `WHERE t.table_schema NOT IN (
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
      JOIN INFORMATION_SCHEMA.COLUMNS c
        ON t.table_catalog = c.table_catalog AND t.table_schema = c.table_schema AND t.table_name = c.table_name 
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
  const sfConfig = {
    account: connection.account,
    username: connection.username,
    password: connection.password,
    warehouse: connection.warehouse,
    database: connection.database,
    schema: connection.schema,
    preQueryStatements: connection.preQueryStatements
  };

  let incomplete;
  const rows = [];

  return new Promise((resolve, reject) => {
    const sfConnection = snowflake.createConnection(sfConfig);
    let preQueryCompletes = 0;

    sfConnection.connect(err => {
      if (err) {
        return reject(err);
      }
      let queryError;
      let resultsSent = false;

      function continueOn(onFinished = () => {}) {
        if (!resultsSent) {
          if (queryError) {
            resultsSent = true;
            return reject(queryError);
          }
          onFinished();
        }
      }

      function _runQuery(query, params = {}) {
        const addRowsToResults = params.hasOwnProperty('addRowsToResults')
          ? params.addRowsToResults
          : true;
        const closeConnection = params.hasOwnProperty('closeConnection')
          ? params.closeConnection
          : true;
        const onCompleted =
          params.onCompleted ||
          (() => {
            return resolve({ rows, incomplete });
          });

        sfConnection
          .execute({ sqlText: query })
          .streamRows()
          .on('error', function(err) {
            queryError = err;
            sfConnection.destroy();
            continueOn(onCompleted);
          })
          .on('data', function(row) {
            if (addRowsToResults) {
              // If we haven't hit the max yet add row to results
              if (rows.length < connection.maxRows) {
                return rows.push(row);
              }

              // Too many rows
              incomplete = true;

              // Destroy the underlying connection
              if (closeConnection) {
                sfConnection.destroy();
              }
              continueOn(onCompleted);
            }
          })
          .on('end', function() {
            if (closeConnection) {
              sfConnection.destroy();
            }
            continueOn(onCompleted);
          });
      }

      // Run with pre query statements
      if (sfConfig.preQueryStatements) {
        // Statements split and filtered by JS because Snowflake driver not supporting multiple SQL statements
        const preQueries = sfConfig.preQueryStatements
          .trim()
          .split(';')
          .filter(q => {
            return q;
          });
        // Run pre queries in parallel
        preQueries.forEach(q => {
          // Don't add rows to results and keep the connection open for the next query
          _runQuery(q, {
            addRowsToResults: false,
            closeConnection: false,

            // Count the number of finished pre query statements
            onCompleted: () => {
              preQueryCompletes += 1;

              // Run the actual query only when every pre query statement finished
              if (preQueryCompletes === preQueries.length) {
                _runQuery(query);
              }
            }
          });
        });
      } else {
        // No pre query statements, run the actual query immediately
        _runQuery(query);
      }
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
  const schemaSql = getSchemaSql(connection.schema);
  return runQuery(schemaSql, connection).then(queryResult =>
    formatSchemaQueryResults(queryResult)
  );
}

const fields = [
  {
    key: 'account',
    formType: 'TEXT',
    label: 'Account'
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
    key: 'warehouse',
    formType: 'TEXT',
    label: 'Warehouse'
  },
  {
    key: 'database',
    formType: 'TEXT',
    label: 'Database'
  },
  {
    key: 'schema',
    formType: 'TEXT',
    label: 'Schema'
  },
  {
    key: 'role',
    formType: 'TEXT',
    label: 'Role'
  },
  {
    key: 'preQueryStatements',
    formType: 'TEXTAREA',
    label: 'Pre-query Statements (Optional)',
    placeholder:
      'Use to enforce session parameters like:\n  ALTER SESSION SET statement_timeout_in_seconds = 15;'
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
