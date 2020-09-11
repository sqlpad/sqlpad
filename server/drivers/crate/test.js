const assert = require('assert');
const testUtils = require('../test-utils.js');
const crate = require('./index.js');

const connection = {
  name: 'test crate',
  driver: 'crate',
  host: 'localhost',
  port: '4200',
};

const dropTable = 'DROP TABLE IF EXISTS test;';
const createTable = 'CREATE TABLE test (id int);';
const inserts = 'INSERT INTO test (id) VALUES (1), (2), (3);';

describe('drivers/crate', function () {
  before(function () {
    this.timeout(10000);
    return (
      crate
        .runQuery(dropTable, connection)
        .then(() => crate.runQuery(createTable, connection))
        .then(() => crate.runQuery(inserts, connection))
        // Crate has to wait before data is available?
        .then(() => new Promise((resolve) => setTimeout(resolve, 5000)))
    );
  });

  it('tests connection', function () {
    return crate.testConnection(connection);
  });

  it('getSchema()', function () {
    return crate.getSchema(connection).then((schemaInfo) => {
      const column = testUtils.getColumn(schemaInfo, 'doc', 'test', 'id');
      assert(column.hasOwnProperty('dataType'));
    });
  });

  it('runQuery under limit', function () {
    return crate
      .runQuery('SELECT id FROM test WHERE id = 1;', connection)
      .then((results) => {
        assert(!results.incomplete, 'not incomplete');
        assert.equal(results.rows.length, 1, 'rows length');
      });
  });

  it('runQuery over limit', function () {
    const limitedConnection = { ...connection, maxRows: 2 };
    return crate
      .runQuery('SELECT * FROM test;', limitedConnection)
      .then((results) => {
        assert(results.incomplete, 'incomplete');
        assert.equal(results.rows.length, 2, 'row length');
      });
  });

  it('returns descriptive error message', function () {
    let error;
    return crate
      .runQuery('SELECT * FROM missing_table;', connection)
      .catch((e) => {
        error = e;
      })
      .then(() => {
        assert(error);
        assert(error.toString().indexOf('missing_table') > -1);
      });
  });
});
