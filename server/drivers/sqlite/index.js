const sqlite3 = require('sqlite3');
const appLog = require('../../lib/app-log');
const splitSql = require('../../lib/split-sql');
const { formatSchemaQueryResults } = require('../utils');

const id = 'sqlite';
const name = 'SQLite';

const fields = [
  {
    key: 'filename',
    formType: 'TEXT',
    label: 'Filename / path' // empty string is anonymous disk backed. :memory: is in memory
  },
  {
    key: 'readonly',
    formType: 'CHECKBOX',
    label: 'Read only'
  }
];

class Client {
  constructor(connection) {
    this.connection = connection;
    this.db = null;
  }

  async connect() {
    if (this.db) {
      throw new Error('Client already connected');
    }
    const { filename, readonly } = this.connection;
    // If read only is selected we'll use that otherwise fall back to default
    // By default sqlite3 driver will open with OPEN_READWRITE | OPEN_CREATE
    // The mode can't be sent in as NULL/undefined to trigger this fallback behavior,
    // so instead we'll make separate calls here

    if (readonly) {
      return new Promise((resolve, reject) => {
        this.db = new sqlite3.Database(filename, sqlite3.OPEN_READONLY, err => {
          if (err) {
            this.db = null;
            return reject(err);
          }
          return resolve();
        });
      });
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(filename, err => {
        if (err) {
          this.db = null;
          return reject(err);
        }
        return resolve();
      });
    });
  }

  async disconnect() {
    if (this.db) {
      const db = this.db;
      this.db = null;

      return new Promise((resolve, reject) => {
        db.close(err => {
          if (err) {
            appLog.error(err, 'Error ending sqlite db');
            return reject(err);
          }
          return resolve();
        });
      });
    }
  }

  /**
   * Run query and return the results
   *
   * Instead of taking the ODBC approach where a result set is suppressed and the last SELECT set is shown,
   * The SQLite implementation shows a jumbled mix of results
   * The reason for this is because we can't tell what was a successful SELECT query vs INSERT/DELETE
   * as they all return an array of row objects
   * @param {string} query - string of SQL to execute
   */
  async runQuery(query) {
    let incomplete = false;
    let suppressedResultSet = false;
    let rows = [];

    const { maxRows } = this.connection;
    const queries = splitSql(query);

    for (const query of queries) {
      // eslint-disable-next-line no-await-in-loop
      const innerRows = await dbAllAsync(this.db, query);
      rows = rows.concat(innerRows);
    }

    if (rows.length > maxRows) {
      rows = rows.slice(0, maxRows);
      incomplete = true;
    }

    return { rows, incomplete, suppressedResultSet };
  }
}

function dbAllAsync(db, query) {
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) {
        return reject(err);
      }
      return resolve(rows);
    });
  });
}

/**
 * Run query for connection
 * Should return { rows, incomplete }
 * @param {string} query
 * @param {object} connection
 */
async function runQuery(query, connection) {
  const db = new Client(connection);
  await db.connect();
  try {
    const result = await db.runQuery(query);
    await db.disconnect();
    return result;
  } catch (error) {
    await db.disconnect();
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
async function getSchema(connection) {
  const db = new Client(connection);
  await db.connect();
  try {
    // For SQLite get tables, then iterate over and get columns for each
    const queryResult = await db.runQuery(`
      SELECT
        'main' as table_schema,
        name as table_name,
        null as column_name,
        null as data_type
      FROM 
        sqlite_master
    `);

    // For each table row, call PRAGMA to get info,
    // and use the combined results for the schema results
    const columnRows = [];
    for (const tableRow of queryResult.rows) {
      const { table_name } = tableRow;
      // eslint-disable-next-line no-await-in-loop
      const columnQueryResult = await db.runQuery(
        `PRAGMA table_info(${table_name})`
      );
      columnQueryResult.rows.forEach(row => {
        columnRows.push({
          table_schema: 'main',
          table_name,
          column_name: row.name,
          data_type: row.type
        });
      });
    }
    // Replace the table queryResult rows with those from column rows
    // The table names will be lifted up (we'll otherwise have null "columns" listed in tree)
    queryResult.rows = columnRows;

    await db.disconnect();
    return formatSchemaQueryResults(queryResult);
  } catch (error) {
    await db.disconnect();
    throw error;
  }
}

module.exports = {
  Client,
  id,
  name,
  fields,
  getSchema,
  runQuery,
  testConnection
};
