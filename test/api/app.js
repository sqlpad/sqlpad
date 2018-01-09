const request = require('request-promise-native')
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
      return request('http://localhost:3010/api/app').then(body => {
        const data = JSON.parse(body)
        utils.expectKeys(data, expectedKeys)
      })
    })

    it('handles unknown baseUrl', function() {
      return request('http://localhost:3010/sqlpad/api/app').then(body => {
        const data = JSON.parse(body)
        utils.expectKeys(data, expectedKeys)
      })
    })
  })
})
