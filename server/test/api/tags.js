const assert = require('assert')
const request = require('supertest')
const app = require('../../app')
const utils = require('../utils')

describe('api/tags', function() {
  before(function() {
    return utils.resetWithUser()
  })

  it('Returns empty array', function() {
    return request(app)
      .get('/api/tags')
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'Expect no error')
        assert(Array.isArray(body.tags), 'tags is an array')
        assert.equal(body.tags.length, 0, '0 length')
      })
  })

  it('Returns expected array', function() {
    return Promise.all([
      request(app)
        .post('/api/queries')
        .auth('admin@test.com', 'admin')
        .send({
          name: 'test query',
          tags: ['one', 'two'],
          connectionId: 'TODO',
          queryText: 'select * from allStuff'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => assert(!response.body.error, 'no error')),
      request(app)
        .post('/api/queries')
        .auth('admin@test.com', 'admin')
        .send({
          name: 'test query',
          tags: ['one', 'three'],
          connectionId: 'TODO',
          queryText: 'select * from allStuff'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => assert(!response.body.error, 'no error'))
    ]).then(() =>
      request(app)
        .get('/api/tags')
        .auth('admin@test.com', 'admin')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          const { body } = response
          assert(!body.error, 'Expect no error')
          assert.equal(body.tags.length, 3, '3 length')
        })
    )
  })
})
