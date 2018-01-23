/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
require('chai').should()

const config = require('../../lib/config.js')

describe('lib/config.js', function() {
  // TODO test when control is inverted/dependencies injected
  // set any process.env variables or args here
  // process.argv.push('--debug')
  // process.env.SQLPAD_DEBUG = 'FALSE'
  // process.env.GOOGLE_CLIENT_ID = 'google-client-id'

  describe('#get()', function() {
    it.skip('should get a value provided by default', function() {
      config.get('port').should.equal(80)
    })
    it.skip('should get a value provided by environment', function() {
      config.get('googleClientId').should.equal('google-client-id')
    })
    it.skip('cli should override env var', function() {
      config.get('debug').should.equal(true)
    })
    it('should only accept key in config items', function() {
      var fn = function() {
        config.get('non-existent-key')
      }
      fn.should.throw(Error)
    })
  })
})
