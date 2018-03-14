const assert = require('assert')
const request = require('supertest')
const app = require('../../app')
const utils = require('../utils')

describe('api/signup', function() {
  before(function() {
    return utils.reset()
  })

  it('allows new user signup', function() {
    return request(app)
      .post('/api/signup')
      .send({
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert(!response.body.error, 'Expect no error')
      })
  })

  it('prevents duplicate signups', function() {
    return request(app)
      .post('/api/signup')
      .send({
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert(response.body.error, 'Expect error user already signed up')
      })
  })

  it('prevents open signups', function() {
    return request(app)
      .post('/api/signup')
      .send({
        password: 'notwhitelisted',
        passwordConfirmation: 'notwhitelisted',
        email: 'notwhitelisted@test.com'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert(response.body.error, 'Expect error needing whitelist')
      })
  })
})

describe('api/signin', function() {
  before(function() {
    return utils.resetWithUser()
  })
  it('signs in user', function() {
    return request(app)
      .post('/api/signin')
      .send({
        password: 'admin',
        email: 'admin@test.com'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert(!response.body.error, 'Expect no error')
      })
  })
})
