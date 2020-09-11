const assert = require('assert');
const testUtils = require('../test-utils.js');
const mysql = require('./index.js');

const connection = {
  name: 'test mysql',
  driver: 'mysql',
  host: 'localhost',
  database: 'sqlpad',
  username: 'sqlpad',
  password: 'sqlpad',
  maxRows: 50000,
};

const dropTable = 'DROP TABLE IF EXISTS test;';
const createTable = 'CREATE TABLE test (id int);';
const inserts = 'INSERT INTO test (id) VALUES (1), (2), (3);';

describe('drivers/mysql', function () {
  before(function () {
    this.timeout(10000);
    return mysql
      .runQuery(dropTable, connection)
      .then(() => mysql.runQuery(createTable, connection))
      .then(() => mysql.runQuery(inserts, connection));
  });

  it('tests connection', function () {
    return mysql.testConnection(connection);
  });

  it('getSchema()', function () {
    return mysql.getSchema(connection).then((schemaInfo) => {
      const column = testUtils.getColumn(schemaInfo, 'sqlpad', 'test', 'id');
      assert(column.hasOwnProperty('dataType'));
    });
  });

  it('runQuery under limit', function () {
    return mysql
      .runQuery('SELECT id FROM test WHERE id = 1;', connection)
      .then((results) => {
        assert(!results.incomplete, 'not incomplete');
        assert.equal(results.rows.length, 1, 'rows length');
      });
  });

  it('runQuery over limit', function () {
    const limitedConnection = { ...connection, maxRows: 2 };
    return mysql
      .runQuery('SELECT * FROM test;', limitedConnection)
      .then((results) => {
        assert(results.incomplete, 'incomplete');
        assert.equal(results.rows.length, 2, 'row length');
      });
  });

  it('returns descriptive error message', function () {
    let error;
    return mysql
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
    const client = new mysql.Client(connection);
    await client.connect();
    await client.runQuery('START TRANSACTION');
    await client.runQuery('SELECT 1 AS val');
    await client.runQuery('ROLLBACK');
    await client.disconnect();
  });
});
