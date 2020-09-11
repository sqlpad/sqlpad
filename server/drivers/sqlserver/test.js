const assert = require('assert');
const testUtils = require('../test-utils.js');
const sqlserver = require('./index.js');

const masterConnection = {
  name: 'test sqlserver',
  driver: 'sqlserver',
  host: 'localhost',
  database: 'master',
  username: 'sa',
  password: 'SuperP4ssw0rd!',
};

const connection = {
  name: 'test sqlserver',
  driver: 'sqlserver',
  host: 'localhost',
  database: 'test',
  username: 'sa',
  password: 'SuperP4ssw0rd!',
  maxRows: 2,
};

const createDb = 'CREATE DATABASE test;';
const createTable = 'CREATE TABLE test (id int);';
const inserts = 'INSERT INTO test (id) VALUES (1), (2), (3);';

describe('drivers/sqlserver', function () {
  before(function () {
    this.timeout(10000);
    return sqlserver
      .runQuery(createDb, masterConnection)
      .then(() => sqlserver.runQuery(createTable, connection))
      .then(() => sqlserver.runQuery(inserts, connection));
  });

  it('tests connection', function () {
    return sqlserver.testConnection(connection);
  });

  it('handles port as string', function () {
    return sqlserver.testConnection({
      name: 'test sqlserver',
      driver: 'sqlserver',
      host: 'localhost',
      database: 'test',
      username: 'sa',
      password: 'SuperP4ssw0rd!',
      port: '1433',
      maxRows: 2,
    });
  });

  it('getSchema()', function () {
    return sqlserver.getSchema(connection).then((schemaInfo) => {
      testUtils.hasColumnDataType(schemaInfo, 'dbo', 'test', 'id', 'int');
    });
  });

  it('runQuery under limit', function () {
    return sqlserver
      .runQuery('SELECT * FROM test WHERE id = 1;', connection)
      .then((results) => {
        assert(!results.incomplete, 'not incomplete');
        assert.equal(results.rows.length, 1, 'row length');
      });
  });

  it('runQuery over limit', function () {
    return sqlserver
      .runQuery('SELECT * FROM test;', connection)
      .then((results) => {
        assert(results.incomplete, 'incomplete');
        assert.equal(results.rows.length, 2, 'row length');
      });
  });
});
