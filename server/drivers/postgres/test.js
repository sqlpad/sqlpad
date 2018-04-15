const assert = require('assert')
const postgres = require('./index.js')

const connection = {
  name: 'test postgres',
  driver: 'postgres',
  host: 'localhost',
  database: 'sqlpad',
  username: 'sqlpad',
  password: 'sqlpad',
  maxRows: 100
}

describe('drivers/postgres', function() {
  it('tests connection', function() {
    return postgres.testConnection(connection)
  })

  it('getSchema()', function() {
    return postgres.getSchema(connection).then(schemaInfo => {
      // Should probably create tables and validate them here
      // For now this is a smoke test of sorts
      assert(schemaInfo)
    })
  })

  it('runQuery under limit', function() {
    return postgres
      .runQuery('SELECT * FROM generate_series(1, 10) gs;', connection)
      .then(results => {
        assert(!results.incomplete, 'not incomplete')
        assert.equal(results.rows.length, 10, 'row length')
      })
  })

  it('runQuery over limit', function() {
    return postgres
      .runQuery('SELECT * FROM generate_series(1, 9000) gs;', connection)
      .then(results => {
        assert(results.incomplete, 'incomplete')
        assert.equal(results.rows.length, 100, 'row length')
      })
  })
})
