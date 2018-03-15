const assert = require('assert')
const utils = require('../utils')

describe('api/queries', function() {
  let query

  before(function() {
    return utils.resetWithUser()
  })

  it('Returns empty array', function() {
    return utils.get('admin', '/api/queries').then(body => {
      assert(!body.error, 'Expect no error')
      assert(Array.isArray(body.queries), 'queries is an array')
      assert.equal(body.queries.length, 0, '0 length')
    })
  })

  it('Creates query', function() {
    return utils
      .post('admin', '/api/queries', {
        name: 'test query',
        tags: ['one', 'two'],
        connectionId: 'TODO',
        queryText: 'select * from allStuff',
        chartConfiguration: {
          chartType: 'line',
          fields: {
            x: 'field1',
            y: 'field2'
          }
        }
      })
      .then(body => {
        assert(!body.error, 'no error')
        assert(body.query._id, 'has _id')
        assert.equal(body.query.name, 'test query')
        query = body.query
      })
  })

  it('Gets array of 1', function() {
    return utils.get('admin', '/api/queries').then(body => {
      assert.equal(body.queries.length, 1, '1 length')
    })
  })

  it('Updates query', function() {
    return utils
      .put('admin', `/api/queries/${query._id}`, {
        name: 'test query2',
        tags: ['one', 'two'],
        connectionId: 'TODO'
      })
      .then(body => {
        assert(!body.error, 'no error')
        assert(body.query._id, 'has _id')
        assert.equal(body.query.name, 'test query2')
      })
  })

  it('Gets updated connection', function() {
    return utils.get('admin', `/api/queries/${query._id}`).then(body => {
      assert(!body.error, 'no error')
      assert.equal(body.query.name, 'test query2')
    })
  })

  it('Requires authentication', function() {
    return utils.get(null, `/api/queries/${query._id}`, 302)
  })

  it('Deletes query', function() {
    return utils.del('admin', `/api/queries/${query._id}`).then(body => {
      assert(!body.error, 'no error')
    })
  })

  it('Returns empty array', function() {
    return utils.get('admin', '/api/queries').then(body => {
      assert(!body.error, 'Expect no error')
      assert(Array.isArray(body.queries), 'queries is an array')
      assert.equal(body.queries.length, 0, '0 length')
    })
  })
})
