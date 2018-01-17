const request = require('supertest')
const app = require('../../app')
const utils = require('../utils')

const expectedKeys = [
  'adminRegistrationOpen',
  'config',
  'smtpConfigured',
  'googleAuthConfigured',
  'version',
  'passport'
]

describe('api/app', function() {
  describe('get', function() {
    it('returns expected values', function() {
      return request(app)
        .get('/api/app')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          utils.expectKeys(response.body, expectedKeys)
        })
    })

    it('handles unknown baseUrl', function() {
      return request(app)
        .get('/literally/any/path/api/app')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          utils.expectKeys(response.body, expectedKeys)
        })
    })
  })
})
