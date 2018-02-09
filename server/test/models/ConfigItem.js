const assert = require('assert')
const ConfigItem = require('../../models/ConfigItem.js')

describe('models/ConfigItem.js', function() {
  describe('ConfigItem', function() {
    // TODO test when control is inverted/dependencies injected
    // set any process.env variables or args here
    // process.argv.push('--debug')
    // process.env.SQLPAD_DEBUG = 'FALSE'
    it.skip('should have expected values', function() {
      const debugItem = ConfigItem.findOneByKey('debug')
      assert.equal(debugItem.effectiveValue, true, 'effectiveValue')
      assert.equal(debugItem.cliValue, true, 'cliValue')
      assert.equal(debugItem.envValue, false, 'envValue')
      assert.equal(debugItem.default, false, 'default')
      assert.equal(debugItem.dbValue, undefined, 'dbValue')
    })

    it('should setDbValue', function() {
      const portItem = ConfigItem.findOneByKey('port')
      portItem.setDbValue('9000')
      assert.equal(portItem.dbValue, '9000', 'dbValue')
    })

    it('should throw error when saving a non-ui item', function() {
      const portItem = ConfigItem.findOneByKey('port')
      assert.throws(
        () => {
          portItem.save()
        },
        Error,
        'portItem.save expect error'
      )
    })

    it('should save without error', function(done) {
      const wrapItem = ConfigItem.findOneByKey('editorWordWrap')
      wrapItem.setDbValue(true)
      wrapItem.save(function(err) {
        assert.ifError(err)
        done()
      })
    })
  })

  describe('.findOneByKey()', function() {
    const configItem = ConfigItem.findOneByKey('port')

    it('should get requested config item', function() {
      assert.equal(configItem.key, 'port', 'key is port')
    })

    it('should be instanceOf ConfigItem', function() {
      assert(configItem instanceof ConfigItem)
    })
  })

  describe('findAll()', function() {
    it('should get array of ConfigItems', function() {
      const configItems = ConfigItem.findAll()
      assert(configItems.length > 1, 'more than 1 item')
      assert(configItems[0] instanceof ConfigItem)
    })
  })
})
