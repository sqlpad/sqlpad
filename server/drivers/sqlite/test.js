const assert = require('assert');
const sqlite3 = require('./index.js');

const connection = {
  filename: './sqlpad_test_sqlite.db'
};

const dropTable = 'DROP TABLE IF EXISTS sqlpad_test;';
const createTable = 'CREATE TABLE sqlpad_test (id INTEGER, name TEXT );';
const insert1 = "INSERT INTO sqlpad_test (id, name) VALUES (1, 'one');";
const insert2 = "INSERT INTO sqlpad_test (id, name) VALUES (2, 'two');";
const insert3 = "INSERT INTO sqlpad_test (id, name) VALUES (3, 'three');";

describe('drivers/sqlite', function() {
  before(async function() {
    this.timeout(10000);
    await sqlite3.runQuery(dropTable, connection);
    await sqlite3.runQuery(createTable, connection);
    await sqlite3.runQuery(insert1, connection);
    await sqlite3.runQuery(insert2, connection);
    await sqlite3.runQuery(insert3, connection);
  });

  it('tests connection', function() {
    return sqlite3.testConnection(connection);
  });

  it('getSchema()', async function() {
    const schemaInfo = await sqlite3.getSchema(connection);

    assert(schemaInfo.main);
    assert(schemaInfo.main.sqlpad_test, 'main.sqlpad_test');
    const columns = schemaInfo.main.sqlpad_test;
    assert.equal(columns.length, 1, 'columns.length');
    assert.equal(columns[0].table_schema, 'main', 'table_schema');
    assert.equal(columns[0].table_name, 'sqlpad_test', 'table_name');
    // column metadata not available in sqlite3
    assert.equal(columns[0].column_name, 'unknown', 'column_name');
    assert.equal(columns[0].data_type, 'unknown', 'data_type');
  });

  it('runQuery under limit', async function() {
    const results = await sqlite3.runQuery(
      'SELECT * FROM sqlpad_test WHERE id = 1;',
      connection
    );
    assert(!results.incomplete, 'not incomplete');
    assert.equal(results.rows.length, 1, 'row length');
  });

  it('runQuery over limit', async function() {
    const connectionWithMaxRows = { ...connection, maxRows: 2 };
    const results = await sqlite3.runQuery(
      'SELECT * FROM sqlpad_test;',
      connectionWithMaxRows
    );
    assert(results.incomplete, 'incomplete');
    assert.equal(results.rows.length, 2, 'row length');
  });

  it('Runs multiple statements', async function() {
    const query = `
      SELECT id FROM sqlpad_test;
      SELECT name FROM sqlpad_test;
      SELECT * FROM sqlpad_test WHERE id = 2
    `;
    const results = await sqlite3.runQuery(query, connection);
    // Instead of taking the ODBC approach where a result set is suppressed and the last SELECT set is shown,
    // The SQLite implementation shows a jumbled mix of results
    // The reason for this is because we can't tell what was a successful SELECT query vs INSERT/DELETE
    // as they all return an array of row objects
    assert.strictEqual(results.suppressedResultSet, false);
    assert.strictEqual(results.incomplete, false);
    assert.equal(results.rows.length, 7, 'row length');
  });

  it('Throws helpful error', async function() {
    let error;
    try {
      await sqlite3.runQuery('SELECT * FROM fake_table', connection);
    } catch (e) {
      error = e;
    }
    assert(error);
    assert(
      error.message.includes('fake_table'),
      'Error message has table reference'
    );
  });

  it('Client cannot connect more than once', async function() {
    const client = new sqlite3.Client(connection);
    await client.connect();
    await assert.rejects(client.connect());
    await client.disconnect();
  });

  it('Client handles multiple disconnects', async function() {
    const client = new sqlite3.Client(connection);
    await client.connect();
    await client.disconnect();
    await client.disconnect();
  });

  it('Client handles multiple runQuery calls', async function() {
    const client = new sqlite3.Client(connection);
    await client.connect();

    const results1 = await client.runQuery('SELECT * FROM sqlpad_test');
    assert.equal(results1.incomplete, false);
    assert.equal(results1.rows.length, 3);
    const results2 = await client.runQuery('SELECT * FROM sqlpad_test');
    assert.equal(results2.incomplete, false);
    assert.equal(results2.rows.length, 3);

    await client.disconnect();
  });
});
