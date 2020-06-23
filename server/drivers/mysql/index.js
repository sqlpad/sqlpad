/* eslint-disable no-await-in-loop */
const fs = require('fs');
const mysql = require('mysql');
const sqlLimiter = require('sql-limiter');
const { formatSchemaQueryResults } = require('../utils');
const appLog = require('../../lib/app-log');

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

class Client {
  constructor(connection) {
    this.connection = connection;
    this.client = null; // AKA myConnection
  }

  /**
   * Establish db client connection if not already connected
   */
  async connect() {
    if (this.client) {
      return;
    }
    const { connection } = this;

    const myConfig = {
      host: connection.host,
      port: connection.port ? connection.port : 3306,
      user: connection.username,
      password: connection.password,
      database: connection.database,
      insecureAuth: connection.mysqlInsecureAuth,
      timezone: 'Z',
      supportBigNumbers: true,
      ssl: connection.mysqlSsl,
      preQueryStatements: connection.preQueryStatements,
    };

    // TODO cache key/cert values
    if (connection.mysqlKey && connection.mysqlCert) {
      myConfig.ssl = {
        key: fs.readFileSync(connection.mysqlKey),
        cert: fs.readFileSync(connection.mysqlCert),
      };
      if (connection.mysqlCA) {
        myConfig.ssl['ca'] = fs.readFileSync(connection.mysqlCA);
      }
    }

    this.client = mysql.createConnection(myConfig);

    this.client.on('error', (err) => {
      appLog.error(err);
    });

    await new Promise((resolve, reject) => {
      this.client.connect(async (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });

    // Run pre query statements
    // Statements split by JS because MySQL multipleStatements is turned off
    if (myConfig.preQueryStatements) {
      // sqlLimiter may return empty statements so they should be stripped out
      const statements = sqlLimiter
        .getStatements(connection.preQueryStatements)
        .map((s) => sqlLimiter.removeTerminator(s))
        .filter((s) => s && s.trim() !== '');

      for (const statement of statements) {
        await new Promise((resolve, reject) => {
          this.client.query(statement, (err) => {
            if (err) {
              return reject(err);
            }
            return resolve();
          });
        });
      }
    }
  }

  /**
   * Disconnect the underlying client if connected
   */
  async disconnect() {
    if (this.client) {
      // Immediately destroys underlying socket.
      // No additional callbacks are called.
      this.client.destroy();
      this.client = null;
    }
  }

  /**
   * Run query using underlying connection
   * @param {string} query
   */
  async runQuery(query) {
    if (!this.client) {
      throw new Error('Must be connected');
    }

    const { maxRows } = this.connection;
    const maxRowsPlusOne = maxRows + 1;
    const limitedQuery = sqlLimiter.limit(
      query,
      ['limit', 'fetch'],
      maxRowsPlusOne
    );

    return new Promise((resolve, reject) => {
      // TODO - use fields from driver to return columns
      // eslint-disable-next-line no-unused-vars
      return this.client.query(limitedQuery, (error, rows, fields) => {
        if (error) {
          return reject(error);
        }
        if (rows.length >= maxRowsPlusOne) {
          return resolve({ rows: rows.slice(0, maxRows), incomplete: true });
        }
        return resolve({ rows, incomplete: false });
      });
    });
  }
}

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
  const schemaSql = getSchemaSql(connection.database);
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
  {
    key: 'mysqlSsl',
    formType: 'CHECKBOX',
    label: 'Use SSL',
  },
  {
    key: 'mysqlCert',
    formType: 'TEXT',
    label: 'Database Certificate Path',
  },
  {
    key: 'mysqlKey',
    formType: 'TEXT',
    label: 'Database Key Path',
  },
  {
    key: 'mysqlCA',
    formType: 'TEXT',
    label: 'Database CA Path',
  },
  {
    key: 'mysqlInsecureAuth',
    formType: 'CHECKBOX',
    label: 'Use old/insecure pre 4.1 Auth System',
  },
  {
    key: 'preQueryStatements',
    formType: 'TEXTAREA',
    label: 'Pre-query Statements (Optional)',
    placeholder:
      'Use to enforce session variables like:\n  SET max_statement_time = 15;\n  SET max_execution_time = 15;\n\nDeny multiple statements per query to avoid overwritten values.',
  },
];

module.exports = {
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection,
  Client,
};
