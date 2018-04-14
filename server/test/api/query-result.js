const assert = require('assert')
const utils = require('../utils')

const queryText = 'SELECT * FROM generate_series(1, 10) gs'

function validateQueryResult(queryResult) {
  assert(queryResult.id, 'id')
  assert(queryResult.cacheKey, 'cacheKey')
  assert(queryResult.startTime, 'startTime')
  assert(queryResult.stopTime, 'stopTime')
  assert(queryResult.queryRunTime >= 0, 'queryRunTime')
  assert(Array.isArray(queryResult.fields), 'fields')
  assert.equal(queryResult.fields.length, 1, 'fields length')
  assert.equal(queryResult.fields[0], 'gs', 'field gs')
  assert.equal(queryResult.incomplete, false, 'incomplete')
  assert(queryResult.meta, 'meta')
  assert(queryResult.meta.gs, 'meta.gs')
  assert(Array.isArray(queryResult.rows), 'rows is array')
  assert.equal(queryResult.rows.length, 10, 'rows length')
}

describe('api/query-result', function() {
  let query, connection

  before(function() {
    return utils
      .resetWithUser()
      .then(() => {
        return utils
          .post('admin', '/api/connections', {
            name: 'test postgres',
            driver: 'postgres',
            host: 'localhost',
            database: 'sqlpad',
            username: 'sqlpad',
            password: 'sqlpad'
          })
          .then(body => {
            connection = body.connection
          })
      })
      .then(() => {
        return utils
          .post('admin', '/api/queries', {
            name: 'test query',
            tags: ['test', 'postgres'],
            connectionId: connection._id,
            queryText
          })
          .then(body => {
            query = body.query
          })
      })
  })

  it('GET /api/query-result/:queryId', function() {
    return utils.get('admin', `/api/query-result/${query._id}`).then(body => {
      assert(!body.error, 'Expect no error')
      validateQueryResult(body.queryResult)
    })
  })

  it('POST /api/query-result', function() {
    return utils
      .post('admin', `/api/query-result`, {
        connectionId: connection._id,
        cacheKey: 'cachekey',
        queryName: 'test query',
        queryText
      })
      .then(body => {
        assert(!body.error, 'Expect no error')
        validateQueryResult(body.queryResult)
      })
  })
})
