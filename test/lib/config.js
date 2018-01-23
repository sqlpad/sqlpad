const assert = require('assert')
const config = require('../../lib/config.js')

describe('lib/config.js', function() {
  // TODO test when control is inverted/dependencies injected
  // set any process.env variables or args here
  // process.argv.push('--debug')
  // process.env.SQLPAD_DEBUG = 'FALSE'
  // process.env.GOOGLE_CLIENT_ID = 'google-client-id'

  describe('#get()', function() {
    it.skip('should get a value provided by default', function() {
      assert.equal(config.get('port'), 80, 'port=80')
    })
    it.skip('should get a value provided by environment', function() {
      assert.equal(
        config.get('googleClientId', 'google-client-id', 'googleClientId')
      )
    })
    it.skip('cli should override env var', function() {
      assert.equal(config.get('debug'), true, 'debug=true')
    })
    it('should only accept key in config items', function() {
      assert.throws(() => config.get('non-existent-key'), Error)
    })
  })
})
