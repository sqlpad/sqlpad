const assert = require('assert');
const unixodbc = require('./index.js');

// Using Windows? You may need to change your db path to something like
// process.env.ODBC_CONNECTION_STRING =
//   'Driver={SQLite3 ODBC Driver};Database=C:\\Users\\<your_user_dir>\\sqlite_test.sqlite';

const connection = {
  connection_string: process.env.ODBC_CONNECTION_STRING, // I.e. ensure os variable is set to connection string
  schema_sql: `
    SELECT
        'dba' as table_schema,
        name as table_name,
        'unknown' as column_name,
        'unknown' as data_type
    FROM sqlite_master
    WHERE type = 'table';
`,
};
const test_schema_name = 'dba'; // sqlite3 does not really have owner

const dropTable = 'DROP TABLE IF EXISTS sqlpad_test;';
const createTable = 'CREATE TABLE sqlpad_test (id INTEGER, name TEXT );'; // NOTE test(s) will fail if table already exists, expect empty database
const insert1 = "INSERT INTO sqlpad_test (id, name) VALUES (1, 'one');";
const insert2 = "INSERT INTO sqlpad_test (id, name) VALUES (2, 'two');";
const insert3 = "INSERT INTO sqlpad_test (id, name) VALUES (3, 'three');";

// TODO test more datatypes:
//   * integer (different sizes
//   * float
//   * char
//   * varchar
//   * decimal
//   * date
//   * datetime
//   * interval
describe('drivers/unixodbc', function () {
  before(async function () {
    this.timeout(10000);
    await unixodbc.runQuery(dropTable, connection);
    await unixodbc.runQuery(createTable, connection);
    await unixodbc.runQuery(insert1, connection);
    await unixodbc.runQuery(insert2, connection);
    await unixodbc.runQuery(insert3, connection);
  });

  it('tests connection', function () {
    return unixodbc.testConnection(connection);
  });

  it('getSchema()', function () {
    return unixodbc.getSchema(connection).then((schemaInfo) => {
      assert(schemaInfo[test_schema_name], test_schema_name);
      assert(
        schemaInfo[test_schema_name].sqlpad_test,
        test_schema_name + '.sqlpad_test'
      );
      const columns = schemaInfo[test_schema_name].sqlpad_test;
      assert.equal(columns.length, 1, 'columns.length');
      assert.equal(columns[0].table_schema, test_schema_name, 'table_schema');
      assert.equal(columns[0].table_name, 'sqlpad_test', 'table_name');
      // column metadata not available in sqlite3
      assert.equal(columns[0].column_name, 'unknown', 'column_name');
      assert.equal(columns[0].data_type, 'unknown', 'data_type');
    });
  });

  it('runQuery under limit', async function () {
    const results = await unixodbc.runQuery(
      'SELECT * FROM sqlpad_test WHERE id = 1;',
      connection
    );
    assert(!results.incomplete, 'not incomplete');
    assert.equal(results.rows.length, 1, 'row length');
  });

  it('runQuery over limit', async function () {
    const connectionWithMaxRows = { ...connection, maxRows: 2 };
    const results = await unixodbc.runQuery(
      'SELECT * FROM sqlpad_test;',
      connectionWithMaxRows
    );
    assert(results.incomplete, 'incomplete');
    assert.equal(results.rows.length, 2, 'row length');
  });

  it('Throws helpful error', async function () {
    let error;
    try {
      await unixodbc.runQuery('SELECT * FROM fake_table', connection);
    } catch (e) {
      error = e;
    }
    assert(error);
    assert(
      error.message.includes('fake_table'),
      'Error message has table reference'
    );
  });

  it('Client cannot connect more than once', async function () {
    const client = new unixodbc.Client(connection);
    await client.connect();
    await assert.rejects(client.connect());
    await client.disconnect();
  });

  it('Client handles multiple disconnects', async function () {
    const client = new unixodbc.Client(connection);
    await client.connect();
    await client.disconnect();
    await client.disconnect();
  });

  it('Client handles multiple runQuery calls', async function () {
    const client = new unixodbc.Client(connection);
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
