/* eslint-env mocha */
var expect = require('chai').expect
var should = require('chai').should()
var Query = require('../../models/Query.js')

describe('models/Query.js', function () {
  before(function before (done) {
    Query._removeAll(done)
  })

  describe('new Query', function () {
    it('should save with all the stuff', function (done) {
      var query = new Query({
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
      query.save(function (err, newQuery) {
        should.not.exist(err)
        should.exist(newQuery._id)
        expect(newQuery).to.be.an.instanceof(Query)
        done()
      })
    })

    it('should save with the least amount of stuff', function (done) {
      var query = new Query({
        _id: 'test-least',
        name: 'test query minimal',
        createdBy: 'test@test.com',
        modifiedBy: 'test@test.com'
      })
      query.save(function (err, newQuery) {
        should.not.exist(err)
        should.exist(newQuery._id)
        newQuery.name.should.equal('test query minimal')
        expect(newQuery).to.be.an.instanceof(Query)
        done()
      })
    })
  })

  describe('.findAll', function () {
    it('should get all the queries', function (done) {
      Query.findAll(function (err, queries) {
        should.not.exist(err)
        queries.should.have.lengthOf(2)
        expect(queries[0]).to.be.an.instanceof(Query)
        done()
      })
    })
  })

  describe('.findOneById', function () {
    it('should get the query requested', function (done) {
      Query.findAll(function (err, queries) {
        should.not.exist(err)
        var id = queries[0]._id
        Query.findOneById(id, function (err, query) {
          should.not.exist(err)
          expect(query).to.be.an.instanceof(Query)
          query._id.should.equal(id)
          done()
        })
      })
    })
  })

  describe('.removeOneById', function () {
    it('should remove the query requested', function (done) {
      Query.removeOneById('test-all', function (err) {
        should.not.exist(err)
        Query.findAll(function (err, queries) {
          should.not.exist(err)
          queries.should.have.lengthOf(1)
          done()
        })
      })
    })
  })
})
