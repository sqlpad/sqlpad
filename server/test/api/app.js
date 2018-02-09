const assert = require('assert')
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

const expectedConfigKeys = [
  'baseUrl',
  'allowCsvDownload',
  'editorWordWrap',
  'queryResultMaxRows',
  'showSchemaCopyButton',
  'publicUrl'
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
          utils.expectKeys(response.body.config, expectedConfigKeys)
          assert.equal(
            Object.keys(response.body.config).length,
            expectedConfigKeys.length,
            'config should only have keys specified'
          )
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
