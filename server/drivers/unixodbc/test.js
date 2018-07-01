const assert = require('assert')
const unixodbc = require('./index.js')

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
}
const test_schema_name = 'dba' // sqlite3 does not really have owner

const createTable = 'CREATE TABLE test (id integer);' // NOTE test(s) will fail if table already exists, expect empty database
const insert1 = 'INSERT INTO test (id) VALUES (1);'
const insert2 = 'INSERT INTO test (id) VALUES (2);'
const insert3 = 'INSERT INTO test (id) VALUES (3);'

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
    this.timeout(10000)
    return unixodbc
      .runQuery(createTable, connection)
      .then(() => unixodbc.runQuery(insert1, connection))
      .then(() => unixodbc.runQuery(insert2, connection))
      .then(() => unixodbc.runQuery(insert3, connection))
  })

  it('tests connection', function() {
    return unixodbc.testConnection(connection)
  })

  it('getSchema()', function() {
    return unixodbc.getSchema(connection).then(schemaInfo => {
      assert(schemaInfo[test_schema_name], test_schema_name)
      assert(schemaInfo[test_schema_name].test, test_schema_name + '.test')
      const columns = schemaInfo[test_schema_name].test
      assert.equal(columns.length, 1, 'columns.length')
      assert.equal(columns[0].table_schema, test_schema_name, 'table_schema')
      assert.equal(columns[0].table_name, 'test', 'table_name')
      // column metadata not available in sqlite3
      assert.equal(columns[0].column_name, 'unknown', 'column_name')
      assert.equal(columns[0].data_type, 'unknown', 'data_type')
    })
  })

  it('runQuery under limit', function() {
    return unixodbc
      .runQuery('SELECT * FROM test WHERE id = 1;', connection)
      .then(results => {
        assert(!results.incomplete, 'not incomplete')
        assert.equal(results.rows.length, 1, 'row length')
      })
  })

  it('runQuery over limit', function() {
    return unixodbc
      .runQuery('SELECT * FROM test;', connection)
      .then(results => {
        assert(results.incomplete, 'incomplete')
        assert.equal(results.rows.length, 2, 'row length')
      })
  })
})
