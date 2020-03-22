const odbc = require('odbc');
const appLog = require('../../lib/app-log');
const splitSql = require('../../lib/split-sql');
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

async function runQuery(query, connection) {
  const client = new Client(connection);
  await client.connect();
  try {
    const result = await client.runQuery(query);
    await client.disconnect();
    return result;
  } catch (error) {
    // try disconnecting just to be sure
    await client.disconnect();
    throw error;
  }
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
  const schema_sql = connection.schema_sql
    ? connection.schema_sql
    : SCHEMA_SQL_INFORMATION_SCHEMA;
  return runQuery(schema_sql, connection).then(queryResult =>
    formatSchemaQueryResults(queryResult)
  );
}

class Client {
  constructor(connection) {
    this.connection = connection;
    this.client = null;
  }

  async connect() {
    if (this.client) {
      throw new Error('Client already connected');
    }

    const { username, password, connection_string } = this.connection;

    let cn = connection_string;

    // Not all drivers require auth
    if (username) {
      cn = cn + ';Uid=' + username;
    }
    if (password) {
      cn = cn + ';Pwd=' + password;
    }

    this.client = await odbc.connect(cn);
  }

  /**
   * Disconnect the connected client
   * Does not propagate error up
   */
  async disconnect() {
    try {
      if (this.client && this.client.close) {
        await this.client.close();
      }
    } catch (error) {
      appLog.error(error, 'error closing connection after error');
    }
    this.client = null;
  }

  async runQuery(query) {
    try {
      let incomplete = false;
      let suppressedResultSet = false;
      const queries = splitSql(query);

      let queryResult;
      let lastResult;

      for (const query of queries) {
        // eslint-disable-next-line no-await-in-loop
        const result = await this.client.query(query);

        // If result has columns it is a candidate for lastQueryResultWithRows
        // Until SQLPad has capability to show multiple result sets we are showing the last one with results
        if (result.columns) {
          // If queryResult was already set we're suppressing a result set
          // Eventually we'll show all results but not at this point
          if (queryResult) {
            suppressedResultSet = true;
          }

          queryResult = result;
        }

        // Keep reference to result as last result
        lastResult = result;
      }

      // If queryResult was never populated because none of the queries returned results, use last result
      if (!queryResult) {
        queryResult = lastResult;
      }

      // Format data correctly
      // node-odbc gives a mix of results depending on query type
      // If columns oject returned with results the query returned rows
      const { columns } = queryResult;
      const rows = [];

      if (columns && columns.length > 0) {
        // iterate over queryResult, which is also an array of rows
        for (const row of queryResult) {
          if (this.connection.maxRows) {
            if (rows.length < this.connection.maxRows) {
              rows.push(row);
            } else {
              incomplete = true;
            }
          } else {
            // Just in case maxRows is not defined push the row
            rows.push(row);
          }
        }
      }

      return { rows, incomplete, suppressedResultSet };
    } catch (error) {
      appLog.error(error);
      // unixodb error has additional info about why the error occurred
      // It has an array of objects with messages.
      // If that exists try to create a message of everything together and throw that
      // Otherwise throw what we got
      if (Array.isArray(error.odbcErrors)) {
        const message = error.odbcErrors.map(e => e.message).join('; ');
        throw new Error(message);
      }
      throw error;
    }
  }
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
      'Database SQL to lookup schema (optional, if omitted default to checking INFORMATION_SCHEMA)'
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
  Client,
  fields,
  getSchema,
  id,
  name,
  runQuery,
  testConnection
};
