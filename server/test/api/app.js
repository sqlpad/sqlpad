const assert = require('assert')
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
  it('returns expected values', function() {
    return utils.get(null, '/api/app').then(body => {
      utils.expectKeys(body, expectedKeys)
      utils.expectKeys(body.config, expectedConfigKeys)
      assert.equal(
        Object.keys(body.config).length,
        expectedConfigKeys.length,
        'config should only have keys specified'
      )
    })
  })

  it('handles unknown baseUrl', function() {
    return utils
      .get(null, '/literally/any/path/api/app')
      .then(body => utils.expectKeys(body, expectedKeys))
  })
})
