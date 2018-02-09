const assert = require('assert')
const Query = require('../../models/Query.js')

describe('models/Query.js', function() {
  before(function() {
    return Query._removeAll()
  })

  describe('new Query', function() {
    it('should save with all the stuff', function(done) {
      const query = new Query({
        _id: 'test-all',
        name: 'test query all',
        tags: ['tag1', 'tag2'],
        connectionId: 'fakeConnectionId',
        queryText: 'select * from allStuff',
        chartConfiguration: {
          chartType: 'line',
          fields: {
            x: 'field1',
            y: 'field2'
          }
        },
        createdBy: 'test@test.com',
        modifiedBy: 'test@test.com'
      })
      query.save(function(err, newQuery) {
        assert.ifError(err)
        assert(newQuery._id, '_id should exist')
        assert(newQuery instanceof Query, 'should be Query')
        done()
      })
    })

    it('should save with the least amount of stuff', function(done) {
      const query = new Query({
        _id: 'test-least',
        name: 'test query minimal',
        createdBy: 'test@test.com',
        modifiedBy: 'test@test.com'
      })
      query.save(function(err, newQuery) {
        assert.ifError(err)
        assert(newQuery._id, '_id should exist')
        assert.equal(newQuery.name, 'test query minimal', 'newQuery.name')
        assert(newQuery instanceof Query, 'instanceOf Query')
        done()
      })
    })
  })

  describe('.findAll', function() {
    it('should get all the queries', function(done) {
      Query.findAll(function(err, queries) {
        assert.ifError(err)
        assert.equal(queries.length, 2, 'queries.length')
        assert(queries[0] instanceof Query, 'instance of Query')
        done()
      })
    })
  })

  describe('.findOneById', function() {
    it('should get the query requested', function(done) {
      Query.findAll(function(err, queries) {
        assert.ifError(err)
        const id = queries[0]._id
        Query.findOneById(id, function(err, query) {
          assert.ifError(err)
          assert(query instanceof Query, 'instance of Query')
          assert.equal(query._id, id, '_id = id')
          done()
        })
      })
    })
  })

  describe('.removeOneById', function() {
    it('should remove the query requested', function(done) {
      Query.removeOneById('test-all', function(err) {
        assert.ifError(err)
        Query.findAll(function(err, queries) {
          assert.ifError(err)
          assert.equal(queries.length, 1, 'queries.length')
          done()
        })
      })
    })
  })
})
