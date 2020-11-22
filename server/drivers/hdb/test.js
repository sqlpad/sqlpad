const assert = require('assert');
const testUtils = require('../test-utils.js');
const hdb = require('./index.js');

const connection = {
  name: 'test hdb (SAP HANA)',
  driver: 'hdb',
  host: 'localhost',
  hanaport: 39017,
  hanadatabase: 'HXE',
  username: 'SYSTEM',
  password: 'SQLPad1!',
  hanaSchema: 'SYSTEM',
  maxRows: 10000,
};

const initSqls = [
  'CREATE TABLE test ( ID INTEGER );',
  'INSERT INTO test VALUES (1);',
  'INSERT INTO test VALUES (2);',
  'INSERT INTO test VALUES (3);',
];

describe('drivers/hdb', function () {
  before(function () {
    this.timeout(10000);
    let seq = hdb.runQuery('DROP TABLE test;', connection).catch(() => {
      // ignore error - table might not exist
    });
    initSqls.forEach((sql) => {
      seq = seq.then(() => hdb.runQuery(sql, connection));
    });
    return seq;
  });

  it('tests connection', function () {
    return hdb.testConnection(connection);
  });

  it('getSchema()', function () {
    return hdb.getSchema(connection).then((schemaInfo) => {
      const column = testUtils.getColumn(schemaInfo, 'SYSTEM', 'TEST', 'ID');
      assert(column.hasOwnProperty('dataType'));
    });
  });

  it('runQuery under limit', function () {
    return hdb
      .runQuery('SELECT id FROM test WHERE id = 1;', connection)
      .then((results) => {
        assert(!results.incomplete, 'not incomplete');
        assert.equal(results.rows.length, 1, 'rows length');
      });
  });

  it('runQuery over limit', function () {
    const limitedConnection = { ...connection, maxRows: 2 };
    return hdb
      .runQuery('SELECT * FROM test;', limitedConnection)
      .then((results) => {
        assert(results.incomplete, 'incomplete');
        assert.equal(results.rows.length, 2, 'row length');
      });
  });

  it('returns descriptive error message', function () {
    let error;

    // NOTE: SAP HANA turns things into ALL CAPS
    return hdb
      .runQuery('SELECT * FROM MISSING_TABLE;', connection)
      .catch((e) => {
        error = e;
      })
      .then(() => {
        assert(error);
        assert(error.toString().indexOf('MISSING_TABLE') > -1);
      });
  });
});
