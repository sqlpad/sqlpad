/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
const expect = require('chai').expect
const should = require('chai').should()

const ConfigItem = require('../../models/ConfigItem.js')

describe('models/ConfigItem.js', function() {
  describe('ConfigItem', function() {
    // TODO test when control is inverted/dependencies injected
    // set any process.env variables or args here
    // process.argv.push('--debug')
    // process.env.SQLPAD_DEBUG = 'FALSE'
    it.skip('should have expected values', function() {
      const debugItem = ConfigItem.findOneByKey('debug')
      expect(debugItem.effectiveValue, 'effective').to.equal(true)
      expect(debugItem.cliValue, 'cli').to.equal(true)
      expect(debugItem.envValue, 'env').to.equal(false)
      expect(debugItem.default, 'default').to.equal(false)
      expect(debugItem.dbValue, 'dbValue').to.not.exist
    })

    it('should setDbValue', function() {
      const portItem = ConfigItem.findOneByKey('port')
      portItem.setDbValue('9000')
      expect(portItem.dbValue).to.equal('9000')
    })

    it('should throw error when saving a non-ui item', function() {
      const portItem = ConfigItem.findOneByKey('port')
      portItem.save.should.throw(Error)
    })

    it('should save without error', function(done) {
      const wrapItem = ConfigItem.findOneByKey('editorWordWrap')
      wrapItem.setDbValue(true)
      wrapItem.save(function(err) {
        should.not.exist(err)
        done()
      })
    })
  })

  describe('.findOneByKey()', function() {
    const configItem = ConfigItem.findOneByKey('port')

    it('should get requested config item', function() {
      expect(configItem.key).to.equal('port')
    })

    it('should be instanceOf ConfigItem', function() {
      expect(configItem).to.be.an.instanceOf(ConfigItem)
    })
  })

  describe('findAll()', function() {
    it('should get array of ConfigItems', function() {
      const configItems = ConfigItem.findAll()
      configItems.should.have.length.above(1)
      expect(configItems[0]).to.be.an.instanceOf(ConfigItem)
    })
  })
})
