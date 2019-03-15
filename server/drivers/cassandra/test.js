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
  before(function() {
    this.timeout(10000);
    let seq = Promise.resolve();
    initSqls.forEach(sql => {
      seq = seq.then(() => cassandra.runQuery(sql, connection));
    });
    return seq;
  });

  it('tests connection', function() {
    return cassandra.testConnection(connection);
  });

  it('getSchema()', function() {
    return cassandra.getSchema(connection).then(schemaInfo => {
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
  });

  it('runQuery under limit', function() {
    return cassandra
      .runQuery('SELECT id FROM test.test WHERE id = 1;', connection)
      .then(results => {
        assert(!results.incomplete, 'not incomplete');
        assert.equal(results.rows.length, 1, 'rows length');
      });
  });

  it('runQuery over limit', function() {
    const limitedConnection = Object.assign({}, connection, { maxRows: 2 });
    return cassandra
      .runQuery('SELECT * FROM test.test;', limitedConnection)
      .then(results => {
        assert(results.incomplete, 'incomplete');
        assert.equal(results.rows.length, 2, 'row length');
      });
  });

  it('returns descriptive error message', function() {
    let error;

    return cassandra
      .runQuery('SELECT * FROM test.missing_table;', connection)
      .catch(e => {
        error = e;
      })
      .then(() => {
        assert(error);
        assert(error.toString().indexOf('missing_table') > -1);
      });
  });
});
