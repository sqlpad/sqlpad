const assert = require('assert')
const presto = require('./index.js')

const connection = {
  name: 'test presto',
  driver: 'presto',
  host: 'localhost',
  port: '8080',
  username: 'sqlpad',
  prestoCatalog: 'memory',
  // will be set after schema is created
  prestoSchema: null
}

const schemaSql = 'CREATE SCHEMA test'
const tableSql = 'CREATE TABLE test (id INT, some_text VARCHAR)'

// For presto, we should test to make sure driver follows the nextUri links properly
// To help with that we can add lots of data
const values = []
for (let i = 0; i < 1000; i++) {
  values.push(`(${i}, 'some text for the text field ${i}')`)
}

const insertSql = 'INSERT INTO test (id, some_text) VALUES ' + values.join(', ')

describe('drivers/presto', function() {
  before(function() {
    this.timeout(60000)
    return presto
      .runQuery(schemaSql, connection)
      .then(() => {
        // prestoSchema needs to be set or otherwise always specified
        connection.prestoSchema = 'test'
        return presto.runQuery(tableSql, connection)
      })
      .then(() => {
        let seq = Promise.resolve()
        for (let i = 0; i < 10; i++) {
          seq = seq.then(() => presto.runQuery(insertSql, connection))
        }
        return seq
      })
  })

  it('tests connection', function() {
    return presto.testConnection(connection)
  })

  it('getSchema()', function() {
    return presto.getSchema(connection).then(schemaInfo => {
      assert(schemaInfo)
      assert(schemaInfo.test, 'test')
      assert(schemaInfo.test.test, 'test.test')
      const columns = schemaInfo.test.test
      assert.equal(columns.length, 2, 'columns.length')
      assert.equal(columns[0].table_schema, 'test', 'table_schema')
      assert.equal(columns[0].table_name, 'test', 'table_name')
      assert.equal(columns[0].column_name, 'id', 'column_name')
      assert(columns[0].hasOwnProperty('data_type'), 'data_type')
    })
  })

  it('runQuery under limit', function() {
    return presto
      .runQuery('SELECT id FROM test WHERE id = 1 LIMIT 1', connection)
      .then(results => {
        assert(!results.incomplete, 'not incomplete')
        assert.equal(results.rows.length, 1, 'rows length')
      })
  })

  it('runQuery over limit', function() {
    const limitedConnection = Object.assign({}, connection, { maxRows: 2 })
    return presto
      .runQuery('SELECT * FROM test LIMIT 10', limitedConnection)
      .then(results => {
        assert(results.incomplete, 'incomplete')
        assert.equal(results.rows.length, 2, 'row length')
      })
  })

  it('returns descriptive error message', function() {
    let error
    return presto
      .runQuery('SELECT * FROM missing_table', connection)
      .catch(e => {
        error = e
      })
      .then(() => {
        assert(error)
        assert(error.toString().indexOf('missing_table') > -1)
      })
  })
})
