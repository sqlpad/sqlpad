const assert = require('assert');
const unixodbc = require('./index.js');

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
`
};
const test_schema_name = 'dba'; // sqlite3 does not really have owner

const createTable = 'CREATE TABLE test (id INTEGER, name TEXT );'; // NOTE test(s) will fail if table already exists, expect empty database
const insert1 = "INSERT INTO test (id, name) VALUES (1, 'one');";
const insert2 = "INSERT INTO test (id, name) VALUES (2, 'two');";
const insert3 = "INSERT INTO test (id, name) VALUES (3, 'three');";

// TODO test more datatypes:
//   * integer (different sizes
//   * float
//   * char
//   * varchar
//   * decimal
//   * date
//   * datetime
//   * interval
describe('drivers/unixodbc', function() {
  before(function() {
    this.timeout(10000);
    return unixodbc
      .runQuery(createTable, connection)
      .then(() => unixodbc.runQuery(insert1, connection))
      .then(() => unixodbc.runQuery(insert2, connection))
      .then(() => unixodbc.runQuery(insert3, connection));
  });

  it('tests connection', function() {
    return unixodbc.testConnection(connection);
  });

  it('getSchema()', function() {
    return unixodbc.getSchema(connection).then(schemaInfo => {
      assert(schemaInfo[test_schema_name], test_schema_name);
      assert(schemaInfo[test_schema_name].test, test_schema_name + '.test');
      const columns = schemaInfo[test_schema_name].test;
      assert.equal(columns.length, 1, 'columns.length');
      assert.equal(columns[0].table_schema, test_schema_name, 'table_schema');
      assert.equal(columns[0].table_name, 'test', 'table_name');
      // column metadata not available in sqlite3
      assert.equal(columns[0].column_name, 'unknown', 'column_name');
      assert.equal(columns[0].data_type, 'unknown', 'data_type');
    });
  });

  it('runQuery under limit', function() {
    return unixodbc
      .runQuery('SELECT * FROM test WHERE id = 1;', connection)
      .then(results => {
        assert(!results.incomplete, 'not incomplete');
        assert.equal(results.rows.length, 1, 'row length');
      });
  });

  it('runQuery over limit', function() {
    const connectionWithMaxRows = { ...connection, maxRows: 2 };
    return unixodbc
      .runQuery('SELECT * FROM test;', connectionWithMaxRows)
      .then(results => {
        assert(results.incomplete, 'incomplete');
        assert.equal(results.rows.length, 2, 'row length');
      });
  });

  it('Runs multiple statements', function() {
    const query = `
      SELECT id FROM test;
      SELECT name from test;
      SELECT * FROM test WHERE id = 2
    `;
    return unixodbc.runQuery(query, connection).then(results => {
      // incomplete indicates truncated results
      // suppressedResultSet indicates missing set
      assert.strictEqual(results.suppressedResultSet, true);
      assert.strictEqual(results.incomplete, false);
      assert.equal(results.rows.length, 1, 'row length');
      assert.strictEqual(results.rows[0].id, 2);
      assert.strictEqual(results.rows[0].name, 'two');
    });
  });

  it('Throws helpful error', async function() {
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
});
