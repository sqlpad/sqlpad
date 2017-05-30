/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
var expect = require('chai').expect
var should = require('chai').should()

describe('models/ConfigItem.js', function () {
    // set any process.env variables here
    // or any process.env.args
  process.argv.push('--debug')
  process.env.SQLPAD_DEBUG = 'FALSE'
  process.env.GOOGLE_CLIENT_ID = 'google-client-id'

  var ConfigItem = require('../../models/ConfigItem.js')

  describe('ConfigItem', function () {
    it('should have expected values', function () {
      var debugItem = ConfigItem.findOneByKey('debug')
      expect(debugItem.effectiveValue).to.equal(true)
      expect(debugItem.cliValue).to.equal(true)
      expect(debugItem.envValue).to.equal(false)
      expect(debugItem.default).to.equal(false)
      expect(debugItem.dbValue).to.not.exist
    })

    it('should setDbValue', function () {
      var portItem = ConfigItem.findOneByKey('port')
      portItem.setDbValue('9000')
      expect(portItem.dbValue).to.equal('9000')
    })

    it('should throw error when saving a non-ui item', function () {
      var portItem = ConfigItem.findOneByKey('port')
      portItem.save.should.throw(Error)
    })

    it('should save without error', function (done) {
      var wrapItem = ConfigItem.findOneByKey('editorWordWrap')
      wrapItem.setDbValue(true)
      wrapItem.save(function (err) {
        should.not.exist(err)
        done()
      })
    })
  })

  describe('.findOneByKey()', function () {
    var configItem = ConfigItem.findOneByKey('port')

    it('should get requested config item', function () {
      expect(configItem.key).to.equal('port')
    })

    it('should be instanceOf ConfigItem', function () {
      expect(configItem).to.be.an.instanceOf(ConfigItem)
    })
  })

  describe('findAll()', function () {
    it('should get array of ConfigItems', function () {
      var configItems = ConfigItem.findAll()
      configItems.should.have.length.above(1)
      expect(configItems[0]).to.be.an.instanceOf(ConfigItem)
    })
  })
})
