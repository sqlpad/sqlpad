const assert = require('assert')
const request = require('supertest')
const app = require('../../app')
const utils = require('../utils')

describe('api/users', function() {
  let user

  before(function() {
    return utils.resetWithUser()
  })

  it('Returns initial array', function() {
    return request(app)
      .get('/api/users')
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'Expect no error')
        assert(Array.isArray(body.users), 'users is an array')
        assert.equal(body.users.length, 2, '2 length')
      })
  })

  it('Creates user', function() {
    return request(app)
      .post('/api/users')
      .auth('admin@test.com', 'admin')
      .send({
        email: 'user1@test.com',
        role: 'editor'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'no error')
        assert(body.user._id, 'has _id')
        assert.equal(body.user.email, 'user1@test.com')
        user = body.user
      })
  })

  it('Gets list of users', function() {
    return request(app)
      .get('/api/users')
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert.equal(body.users.length, 3, '3 length')
      })
  })

  it('Updates user', function() {
    return request(app)
      .put(`/api/users/${user._id}`)
      .auth('admin@test.com', 'admin')
      .send({
        role: 'admin'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'no error')
        assert.equal(body.user.role, 'admin')
      })
  })

  it('Requires authentication', function() {
    return request(app)
      .get(`/api/users`)
      .expect(302) // redirect
  })

  it('Create requires admin', function() {
    return request(app)
      .post('/api/users')
      .auth('editor@test.com', 'editor')
      .send({
        email: 'user2@test.com',
        role: 'editor'
      })
      .expect(500)
  })

  it('Deletes user', function() {
    return request(app)
      .delete(`/api/users/${user._id}`)
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'no error')
      })
  })

  it('Returns expected list', function() {
    return request(app)
      .get('/api/users')
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'Expect no error')
        assert(Array.isArray(body.users), 'users is an array')
        assert.equal(body.users.length, 2, '2 length')
      })
  })
})
