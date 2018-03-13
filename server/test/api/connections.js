const assert = require('assert')
const request = require('supertest')
const app = require('../../app')
const utils = require('../utils')

describe('api/connections', function() {
  let connection

  before(function() {
    return utils.resetWithUser()
  })

  it('Returns empty array', function() {
    return request(app)
      .get('/api/connections')
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'Expect no error')
        assert(Array.isArray(body.connections), 'connections is an array')
        assert.equal(body.connections.length, 0, '0 length')
      })
  })

  it('Creates connection', function() {
    return request(app)
      .post('/api/connections')
      .auth('admin@test.com', 'admin')
      .send({
        driver: 'postgres',
        name: 'test connection',
        host: 'localhost',
        database: 'testdb',
        username: 'username',
        password: 'password'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'no error')
        assert(body.connection._id, 'has _id')
        assert.equal(body.connection.driver, 'postgres')
        connection = body.connection
      })
  })

  it('Gets array of 1', function() {
    return request(app)
      .get('/api/connections')
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert.equal(body.connections.length, 1, '0 length')
      })
  })

  it('Updates connection', function() {
    return request(app)
      .put(`/api/connections/${connection._id}`)
      .auth('admin@test.com', 'admin')
      .send({
        driver: 'postgres',
        name: 'test connection update',
        host: 'localhost',
        database: 'testdb',
        username: 'username',
        password: 'password'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'no error')
        assert(body.connection._id, 'has _id')
        assert.equal(body.connection.name, 'test connection update')
      })
  })

  it('Gets updated connection', function() {
    return request(app)
      .get(`/api/connections/${connection._id}`)
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'no error')
        assert.equal(body.connection.name, 'test connection update')
      })
  })

  it('Requires authentication', function() {
    return request(app)
      .get(`/api/connections/${connection._id}`)
      .expect(302) // redirect
  })

  it('Create requires admin', function() {
    return request(app)
      .post('/api/connections')
      .auth('editor@test.com', 'editor')
      .send({
        driver: 'postgres',
        name: 'test connection 2',
        host: 'localhost',
        database: 'testdb',
        username: 'username',
        password: 'password'
      })
      .expect(500)
  })

  it('Deletes connection', function() {
    return request(app)
      .delete(`/api/connections/${connection._id}`)
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
      .get('/api/connections')
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'Expect no error')
        assert(Array.isArray(body.connections), 'connections is an array')
        assert.equal(body.connections.length, 0, '0 length')
      })
  })
})
