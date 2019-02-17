const assert = require('assert')
const mock = require('./index.js')

const connection = {
  name: 'test postgres',
  driver: 'mock',
  host: 'localhost',
  database: 'sqlpad',
  username: 'sqlpad',
  password: 'sqlpad',
  maxRows: 100
}

describe('drivers/mock', function() {
  it('tests connection', function() {
    return mock.testConnection(connection)
  })

  it('getSchema()', function() {
    return mock.getSchema(connection).then(schemaInfo => {
      // Should probably create tables and validate them here
      // For now this is a smoke test of sorts
      assert(schemaInfo)
    })
  })

  it('runQuery under limit', function() {
    const c = Object.assign({}, connection, { maxRows: 10000 })
    return mock.runQuery('SELECT * FROM doesnt matter;', c).then(results => {
      assert(!results.incomplete, 'not incomplete')
      // TODO make actual length based on something in query
      assert.equal(results.rows.length, 1000, 'row length')
    })
  })

  it('runQuery over limit', function() {
    const c = Object.assign({}, connection, { maxRows: 10 })
    return mock.runQuery('SELECT * FROM doesnt matter;', c).then(results => {
      assert(results.incomplete, 'incomplete')
      assert.equal(results.rows.length, 10, 'row length')
    })
  })
})
