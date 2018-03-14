const assert = require('assert')
const request = require('supertest')
const app = require('../../app')
const utils = require('../utils')

describe('api/queries', function() {
  let query

  before(function() {
    return utils.resetWithUser()
  })

  it('Returns empty array', function() {
    return request(app)
      .get('/api/queries')
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'Expect no error')
        assert(Array.isArray(body.queries), 'queries is an array')
        assert.equal(body.queries.length, 0, '0 length')
      })
  })

  it('Creates query', function() {
    return request(app)
      .post('/api/queries')
      .auth('admin@test.com', 'admin')
      .send({
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
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'no error')
        assert(body.query._id, 'has _id')
        assert.equal(body.query.name, 'test query')
        query = body.query
      })
  })

  it('Gets array of 1', function() {
    return request(app)
      .get('/api/queries')
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert.equal(body.queries.length, 1, '1 length')
      })
  })

  it('Updates query', function() {
    return request(app)
      .put(`/api/queries/${query._id}`)
      .auth('admin@test.com', 'admin')
      .send({
        name: 'test query2',
        tags: ['one', 'two'],
        connectionId: 'TODO'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'no error')
        assert(body.query._id, 'has _id')
        assert.equal(body.query.name, 'test query2')
      })
  })

  it('Gets updated connection', function() {
    return request(app)
      .get(`/api/queries/${query._id}`)
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'no error')
        assert.equal(body.query.name, 'test query2')
      })
  })

  it('Requires authentication', function() {
    return request(app)
      .get(`/api/queries/${query._id}`)
      .expect(302) // redirect
  })

  it('Deletes query', function() {
    return request(app)
      .delete(`/api/queries/${query._id}`)
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'no error')
      })
  })

  it('Returns empty array', function() {
    return request(app)
      .get('/api/queries')
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'Expect no error')
        assert(Array.isArray(body.queries), 'queries is an array')
        assert.equal(body.queries.length, 0, '0 length')
      })
  })
})
