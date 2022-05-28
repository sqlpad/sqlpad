const assert = require('assert');
const testUtils = require('../test-utils');
const tdengine = require('./index');

const connection = {
  name: 'test tdengine',
  driver: 'tdengine',
  host: 'localhost',
  database: 'log',
  username: 'root',
  password: 'taosdata',
};

describe('drivers/tdengine', function () {
  before(async function () {
    this.timeout(10000);
    await tdengine.runQuery('DROP TABLE IF EXISTS test;', connection);
    await tdengine.runQuery(
      'CREATE TABLE test (ts TIMESTAMP, value INT);',
      connection
    );
    await tdengine.runQuery('INSERT INTO test VALUES (NOW, 1);', connection);
    await tdengine.runQuery('INSERT INTO test VALUES (NOW, 2);', connection);
    await tdengine.runQuery('INSERT INTO test VALUES (NOW, 3);', connection);
  });

  it('tests connection', async function () {
    await tdengine.testConnection(connection);
  });

  it('getSchema()', async function () {
    const schemaInfo = await tdengine.getSchema(connection);

    testUtils.hasColumnDataType(schemaInfo, 'log', 'test', 'ts', 'TIMESTAMP');
    testUtils.hasColumnDataType(schemaInfo, 'log', 'test', 'value', 'INT');
  });

  it('runQuery under limit', async function () {
    const results = await tdengine.runQuery(
      'SELECT * FROM test WHERE value = 1;',
      connection
    );
    assert(!results.incomplete, 'not incomplete');
    assert.equal(results.rows.length, 1, 'row length');
  });

  it('runQuery over limit', async function () {
    const connectionWithMaxRows = { ...connection, maxRows: 2 };
    const results = await tdengine.runQuery(
      'SELECT * FROM test;',
      connectionWithMaxRows
    );
    assert(results.incomplete, 'incomplete');
    assert.equal(results.rows.length, 2, 'row length');
  });

  it('returns descriptive error message', function () {
    let error;
    return tdengine
      .runQuery('SELECT * FROM missing_table;', connection)
      .catch((e) => {
        error = e;
      })
      .then(() => {
        assert(error);
        assert(error.toString().indexOf('Table does not exist') > -1);
      });
  });
});
