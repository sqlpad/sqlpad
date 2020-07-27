const assert = require('assert');
const mysql2 = require('./index.js');

const connection = {
  name: 'test mysql2',
  driver: 'mysql2',
  host: 'localhost',
  database: 'sqlpad',
  username: 'sqlpad',
  password: 'sqlpad',
  maxRows: 50000,
};

const dropTable = 'DROP TABLE IF EXISTS test;';
const createTable = 'CREATE TABLE test (id int);';
const inserts = 'INSERT INTO test (id) VALUES (1), (2), (3);';

describe('drivers/mysql2', function () {
  before(function () {
    this.timeout(10000);
    return mysql2
      .runQuery(dropTable, connection)
      .then(() => mysql2.runQuery(createTable, connection))
      .then(() => mysql2.runQuery(inserts, connection));
  });

  it('tests connection', function () {
    return mysql2.testConnection(connection);
  });

  it('getSchema()', function () {
    return mysql2.getSchema(connection).then((schemaInfo) => {
      assert(schemaInfo.sqlpad, 'sqlpad');
      assert(schemaInfo.sqlpad.test, 'sqlpad.test');
      const columns = schemaInfo.sqlpad.test;
      assert.equal(columns.length, 1, 'columns.length');
      assert.equal(columns[0].table_schema, 'sqlpad', 'table_schema');
      assert.equal(columns[0].table_name, 'test', 'table_name');
      assert.equal(columns[0].column_name, 'id', 'column_name');
      assert(columns[0].hasOwnProperty('data_type'), 'data_type');
    });
  });

  it('runQuery under limit', function () {
    return mysql2
      .runQuery('SELECT id FROM test WHERE id = 1;', connection)
      .then((results) => {
        assert(!results.incomplete, 'not incomplete');
        assert.equal(results.rows.length, 1, 'rows length');
      });
  });

  it('runQuery over limit', function () {
    const limitedConnection = { ...connection, maxRows: 2 };
    return mysql2
      .runQuery('SELECT * FROM test;', limitedConnection)
      .then((results) => {
        assert(results.incomplete, 'incomplete');
        assert.equal(results.rows.length, 2, 'row length');
      });
  });

  it('returns descriptive error message', function () {
    let error;
    return mysql2
      .runQuery('SELECT * FROM missing_table;', connection)
      .catch((e) => {
        error = e;
      })
      .then(() => {
        assert(error);
        assert(error.toString().indexOf('missing_table') > -1);
      });
  });

  it('Client handles client interface', async function () {
    const client = new mysql2.Client(connection);
    await client.connect();
    await client.runQuery('START TRANSACTION');
    await client.runQuery('SELECT 1 AS val');
    await client.runQuery('ROLLBACK');
    await client.disconnect();
  });
});
