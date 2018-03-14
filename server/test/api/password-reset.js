const assert = require('assert')
const request = require('supertest')
const app = require('../../app')
const utils = require('../utils')
const uuid = require('uuid')
const User = require('../../models/User')

function setReset() {
  return User.findOneByEmail('admin@test.com').then(user => {
    const passwordResetId = uuid.v4()
    user.passwordResetId = passwordResetId
    return user.save().then(() => passwordResetId)
  })
}

describe('api/password-reset', function() {
  before(function() {
    return utils.resetWithUser()
  })

  it('Allows resetting password', function() {
    return setReset().then(passwordResetId => {
      return request(app)
        .post(`/api/password-reset/${passwordResetId}`)
        .auth('admin@test.com', 'admin')
        .send({
          email: 'admin@test.com',
          password: 'admin',
          passwordConfirmation: 'admin'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => assert(!response.body.error, 'Expect no error'))
    })
  })

  it('Errors for wrong passwordResetId', function() {
    return setReset().then(passwordResetId => {
      return request(app)
        .post(`/api/password-reset/123`)
        .auth('admin@test.com', 'admin')
        .send({
          email: 'admin@test.com',
          password: 'admin',
          passwordConfirmation: 'admin'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => assert(response.body.error, 'Expect error'))
    })
  })

  it('Errors for wrong email', function() {
    return setReset().then(passwordResetId => {
      return request(app)
        .post(`/api/password-reset/${passwordResetId}`)
        .auth('admin@test.com', 'admin')
        .send({
          email: 'wrongemail@test.com',
          password: 'admin',
          passwordConfirmation: 'admin'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => assert(response.body.error, 'Expect error'))
    })
  })

  it('Errors for mismatched passwords', function() {
    return setReset().then(passwordResetId => {
      return request(app)
        .post(`/api/password-reset/${passwordResetId}`)
        .auth('admin@test.com', 'admin')
        .send({
          email: 'admin@test.com',
          password: 'admin2',
          passwordConfirmation: 'admin'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => assert(response.body.error, 'Expect error'))
    })
  })
})
