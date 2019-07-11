/* eslint-disable no-await-in-loop */
const assert = require('assert');
const cassandra = require('./index.js');

const connection = {
  name: 'test cassandra',
  driver: 'cassandra',
  contactPoints: 'localhost'
};

const initSqls = [
  `DROP KEYSPACE IF EXISTS test;`,
  `CREATE KEYSPACE test WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };`,
  'CREATE TABLE test.test ( id int PRIMARY KEY, name text);',
  `INSERT INTO test.test (id, name) VALUES (1, 'one');`,
  `INSERT INTO test.test (id, name) VALUES (2, 'two');`,
  `INSERT INTO test.test (id, name) VALUES (3, 'three');`
];

describe('drivers/cassandra', function() {
  before(async function() {
    this.timeout(10000);
    for (const sql of initSqls) {
      await cassandra.runQuery(sql, connection);
    }
  });

  it('tests connection', function() {
    return cassandra.testConnection(connection);
  });

  it('getSchema()', async function() {
    const schemaInfo = await cassandra.getSchema(connection);
    assert(schemaInfo);
    assert(schemaInfo.test, 'test');
    assert(schemaInfo.test.test, 'test.test');
    const columns = schemaInfo.test.test;
    assert.equal(columns.length, 2, 'columns.length');
    assert.equal(columns[0].table_schema, 'test', 'table_schema');
    assert.equal(columns[0].table_name, 'test', 'table_name');
    assert.equal(columns[0].column_name, 'id', 'column_name');
    assert(columns[0].hasOwnProperty('data_type'), 'data_type');
  });

  it('runQuery under limit', async function() {
    const results = await cassandra.runQuery(
      'SELECT id FROM test.test WHERE id = 1;',
      connection
    );
    assert(!results.incomplete, 'not incomplete');
    assert.equal(results.rows.length, 1, 'rows length');
  });

  it('runQuery over limit', async function() {
    const limitedConnection = Object.assign({}, connection, { maxRows: 2 });
    const results = await cassandra.runQuery(
      'SELECT * FROM test.test;',
      limitedConnection
    );
    assert(results.incomplete, 'incomplete');
    assert.equal(results.rows.length, 2, 'row length');
  });

  it('returns descriptive error message', async function() {
    let error;
    try {
      await cassandra.runQuery('SELECT * FROM test.missing_table;', connection);
    } catch (e) {
      error = e;
    }
    assert(error);
    assert(error.toString().indexOf('missing_table') > -1);
  });
});
