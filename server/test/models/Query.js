const assert = require('assert')
const Query = require('../../models/Query.js')
const utils = require('../utils')

describe('models/Query.js', function() {
  before(function() {
    return utils.reset()
  })

  describe('new Query', function() {
    it('should save with all the stuff', function() {
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
      return query.save().then(newQuery => {
        assert(newQuery._id, '_id should exist')
        assert(newQuery instanceof Query, 'should be Query')
      })
    })

    it('should save with the least amount of stuff', function() {
      const query = new Query({
        _id: 'test-least',
        name: 'test query minimal',
        createdBy: 'test@test.com',
        modifiedBy: 'test@test.com'
      })
      return query.save().then(newQuery => {
        assert(newQuery._id, '_id should exist')
        assert.equal(newQuery.name, 'test query minimal', 'newQuery.name')
        assert(newQuery instanceof Query, 'instanceOf Query')
      })
    })
  })

  describe('.findAll', function() {
    it('should get all the queries', function() {
      return Query.findAll().then(queries => {
        assert.equal(queries.length, 2, 'queries.length')
        assert(queries[0] instanceof Query, 'instance of Query')
      })
    })
  })

  describe('.findOneById', function() {
    it('should get the query requested', function() {
      return Query.findAll().then(queries => {
        const id = queries[0]._id
        return Query.findOneById(id).then(query => {
          assert(query instanceof Query, 'instance of Query')
          assert.equal(query._id, id, '_id = id')
        })
      })
    })
  })

  describe('.removeOneById', function() {
    it('should remove the query requested', function() {
      return Query.removeOneById('test-all').then(() => {
        return Query.findAll().then(queries => {
          assert.equal(queries.length, 1, 'queries.length')
        })
      })
    })
  })
})
