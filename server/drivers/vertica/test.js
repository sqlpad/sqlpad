const assert = require('assert');
const testUtils = require('../test-utils.js');
const vertica = require('./index.js');

const connection = {
  name: 'test vertica',
  driver: 'vertica',
  host: 'localhost',
  username: 'dbadmin',
  maxRows: 10000,
};

const initSql = `
  DROP TABLE IF EXISTS test;

  CREATE TABLE test (id int);
  COMMIT;

  -- In vertica you must commit after insert
  INSERT INTO test (id) VALUES (1); 
  INSERT INTO test (id) VALUES (2);
  INSERT INTO test (id) VALUES (3);
  COMMIT;
`;

describe('drivers/vertica', function () {
  before(function () {
    this.timeout(10000);
    return vertica.runQuery(initSql, connection);
  });

  it('tests connection', function () {
    return vertica.testConnection(connection);
  });

  it('getSchema()', function () {
    return vertica.getSchema(connection).then((schemaInfo) => {
      const column = testUtils.getColumn(schemaInfo, 'public', 'test', 'id');
      assert(column.hasOwnProperty('dataType'));
    });
  });

  it('runQuery under limit', function () {
    return vertica
      .runQuery('SELECT id FROM test WHERE id = 1;', connection)
      .then((results) => {
        assert(!results.incomplete, 'not incomplete');
        assert.equal(results.rows.length, 1, 'rows length');
      });
  });

  it('runQuery over limit', function () {
    const limitedConnection = { ...connection, maxRows: 2 };
    return vertica
      .runQuery('SELECT * FROM test;', limitedConnection)
      .then((results) => {
        assert(results.incomplete, 'incomplete');
        assert.equal(results.rows.length, 2, 'row length');
      });
  });

  it('returns descriptive error message', function () {
    let error;
    return vertica
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
