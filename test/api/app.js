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
      return utils.get('/api/app').then(data => {
        utils.expectKeys(data, expectedKeys)
      })
    })

    it('handles unknown baseUrl', function() {
      return utils.get('/sqlpad/api/app').then(data => {
        utils.expectKeys(data, expectedKeys)
      })
    })
  })
})
